
from flask import Flask, request, jsonify, render_template, redirect, url_for, make_response, session
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, set_access_cookies
from flask_cors import CORS
import psycopg2
import os
from datetime import timedelta, datetime
from psycopg2 import Error as psycopg2Error
from psycopg2.errors import UniqueViolation
from psycopg2.extras import RealDictCursor
import json

# Initialize Flask App
app = Flask(__name__,
            template_folder=os.path.abspath('templates'),
            static_folder=os.path.abspath('static'))

# Configure CORS and JWT
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['JWT_SECRET_KEY'] = 'supersecretkey'  # Change in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['JWT_ACCESS_COOKIE_NAME'] = 'access_token_cookie'
app.config['SESSION_TYPE'] = 'filesystem'  # For persistent sessions
app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 1 hour session


# Database Configuration
DB_CONFIG = {
    "host": "ep-quiet-heart-a5nxbjq1-pooler.us-east-2.aws.neon.tech",
    "database": "tradingjournal",
    "user": "tradingjournal_owner",
    "password": "npg_OknfX9H1JWva",
    "sslmode": "require"
}

def get_db_connection(real_dict=False):
    """Create and return a new database connection"""
    if real_dict:
        return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)
    return psycopg2.connect(**DB_CONFIG)


# -------------------- Authentication Routes -------------------- #
@app.route('/signup', methods=['POST'])
def signup():
    try:
        # Get form data
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')

        if not username or not email or not password:
            return jsonify({'error': 'All fields are required'}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                # Pre-check for duplicate username and email
                cursor.execute("SELECT username, email FROM users WHERE username = %s OR email = %s", (username, email))
                existing_user = cursor.fetchone()

                if existing_user:
                    if existing_user[0] == username and existing_user[1] == email:
                        return jsonify({
                            'error': 'Both username and email are already registered.',
                            'redirect': url_for('login_page', email=email)
                        }), 409
                    elif existing_user[0] == username:
                        return jsonify({
                            'error': 'Username already taken. Please choose another.',
                            'redirect': url_for('signup_page', username=username)
                        }), 409
                    elif existing_user[1] == email:
                        return jsonify({
                            'error': 'Email already registered. Please login.',
                            'redirect': url_for('login_page', email=email)
                        }), 409

                # If no duplicates, insert new user
                cursor.execute(
                    "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING id",
                    (username, email, hashed_password)
                )
                user_id = cursor.fetchone()[0]
                conn.commit()

                # Generate access token
                access_token = create_access_token(identity=str(user_id))

                response = make_response(jsonify({'access_token': access_token}))
                set_access_cookies(response, access_token)
                return response

    except Exception as e:
        print("🚨 ERROR:", str(e))
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Internal Server Error'}), 500






@app.route('/login', methods=['POST'])
def login():
    try:
        # Get email and password from form data
        email = request.form['email']
        password = request.form['password']

        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT id, username, password_hash FROM users WHERE email = %s", (email,))
                user = cursor.fetchone()

                # If user doesn't exist, return JSON response with 404 status
                if not user:
                    return jsonify({
                        'error': 'User does not exist',
                        'redirect': url_for('signup_page', email=email)  # Include email in redirect URL
                    }), 404

                # Check if the password matches the stored hash
                if bcrypt.check_password_hash(user[2], password):
                    # Generate access token
                    access_token = create_access_token(identity=str(user[0]))  # Convert user ID to string
                    response = make_response(jsonify({'message': 'Login successful', 'redirect': url_for('dashboard')}))

                    # Set the access token in the HTTP-only cookie
                    response.set_cookie('access_token_cookie', access_token, httponly=True)

                    # Return response with the redirect URL
                    return response, 200

                # Invalid credentials
                return jsonify({'error': 'Invalid credentials. Please try again!'}), 401

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': 'Internal Server Error'}), 500




@app.route('/dashboard')
@jwt_required(locations=['cookies'])  # Ensure JWT is read from cookies
def dashboard():
    user_id = get_jwt_identity()

    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT username FROM users WHERE id = %s", (user_id,))
            user = cursor.fetchone()

            if not user:
                return jsonify({'error': 'User not found'}), 404

            cursor.execute("""
                SELECT 
                    COALESCE(SUM(profit_loss), 0) AS total_profit,
                    COUNT(*) FILTER (WHERE profit_loss > 0) AS profit_trades,
                    COUNT(*) FILTER (WHERE profit_loss <= 0) AS loss_trades
                FROM journal_entries
                WHERE user_id = %s
            """, (user_id,))
            portfolio_summary = cursor.fetchone()

    return render_template(
        'dashboard.html',
        username=user[0],
        total_profit=portfolio_summary[0],
        profit_trades=portfolio_summary[1] or 0,
        loss_trades=portfolio_summary[2] or 0
    )


@app.route('/journal')
def journal():
    print("Session Data:", session)  # Debugging line
    # if not session.get('user_id'):
        # return redirect(url_for('login_page'))
    return render_template('journal.html')


@app.route('/add-journal-entry', methods=['POST'])
def add_journal_entry():
    try:
        data = request.json
        
        # Validate user_id
        try:
            user_id = int(data.get('user_id'))
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid user ID'}), 400

        data['trade_date'] = datetime.now().strftime('%Y-%m-%d')

        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO journal_entries (
                        user_id, trade_date, timeframe, stock, 
                        position_size, direction, entry_price,
                        entry_time, entry_reason, exit_price,
                        exit_time, exit_reason, stop_loss_price,
                        target_price, risk_reward_ratio, profit_loss,
                        percentage_return, overall_market_trend,
                        news_impact, mistakes, what_went_well,
                        emotions_during_trade, improvement_suggestions
                    ) VALUES (
                        %(user_id)s, %(trade_date)s, %(timeframe)s,
                        %(stock)s, %(position_size)s, %(direction)s,
                        %(entry_price)s, %(entry_time)s, %(entry_reason)s,
                        %(exit_price)s, %(exit_time)s, %(exit_reason)s,
                        %(stop_loss_price)s, %(target_price)s,
                        %(risk_reward_ratio)s, %(profit_loss)s,
                        %(percentage_return)s, %(overall_market_trend)s,
                        %(news_impact)s, %(mistakes)s, %(what_went_well)s,
                        %(emotions_during_trade)s, %(improvement_suggestions)s
                    ) RETURNING id
                    """, data)
                result = cursor.fetchone()
                conn.commit()
                return jsonify({"entry_id": result['id']}), 201
                
    except Exception as e:
        print(f"Error adding journal entry: {e}")
        return jsonify({"error": "Failed to add journal entry"}), 500



# GET Route - Retrieve All Journal Entries
@app.route('/get-journal-entries', methods=['GET'])
def get_journal_entries():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400

        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM journal_entries 
                    WHERE user_id = %s 
                    ORDER BY trade_date DESC
                """, (user_id,))
                entries = cursor.fetchall()
                
                # Convert datetime objects to strings
                for entry in entries:
                    if 'trade_date' in entry:
                        entry['trade_date'] = entry['trade_date'].isoformat()
                    if 'entry_time' in entry:
                        entry['entry_time'] = str(entry['entry_time'])
                    if 'exit_time' in entry:
                        entry['exit_time'] = str(entry['exit_time'])
                
                return jsonify(entries), 200
                
    except Exception as e:
        print(f"Error fetching entries: {str(e)}")
        return jsonify({'error': 'Failed to retrieve entries'}), 500

# PUT Route - Update Journal Entry
@app.route('/update-journal-entry/<int:entry_id>', methods=['PUT'])
def update_journal_entry(entry_id):
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                # Build dynamic update query
                set_clauses = []
                values = []
                for key, value in data.items():
                    set_clauses.append(f"{key} = %s")
                    values.append(value)
                
                if not set_clauses:
                    return jsonify({'error': 'No fields to update'}), 400
                
                query = f"""
                    UPDATE journal_entries 
                    SET {', '.join(set_clauses)}
                    WHERE id = %s
                    RETURNING *
                """
                values.append(entry_id)
                
                cursor.execute(query, tuple(values))
                updated_entry = cursor.fetchone()
                conn.commit()
                
                if not updated_entry:
                    return jsonify({'error': 'Entry not found'}), 404
                
                # Convert datetime objects
                if 'trade_date' in updated_entry:
                    updated_entry['trade_date'] = updated_entry['trade_date'].isoformat()
                if 'entry_time' in updated_entry:
                    updated_entry['entry_time'] = str(updated_entry['entry_time'])
                if 'exit_time' in updated_entry:
                    updated_entry['exit_time'] = str(updated_entry['exit_time'])
                
                return jsonify(updated_entry), 200
                
    except Exception as e:
        print(f"Update error: {str(e)}")
        return jsonify({'error': 'Failed to update entry'}), 500

# DELETE Route - Remove Journal Entry
@app.route('/delete-journal-entry/<int:entry_id>', methods=['DELETE'])
def delete_journal_entry(entry_id):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                # Check if entry exists first
                cursor.execute("""
                    SELECT id FROM journal_entries 
                    WHERE id = %s
                """, (entry_id,))
                if not cursor.fetchone():
                    return jsonify({'error': 'Entry not found'}), 404
                
                # Delete the entry
                cursor.execute("""
                    DELETE FROM journal_entries 
                    WHERE id = %s
                """, (entry_id,))
                conn.commit()
                
                return jsonify({'message': 'Entry deleted successfully'}), 200
                
    except Exception as e:
        print(f"Delete error: {str(e)}")
        return jsonify({'error': 'Failed to delete entry'}), 500


# -------------------- Notes Handling -------------------- #
@app.route('/notes', methods=['POST'])
@jwt_required()
def add_note():
    try:
        user_id = get_jwt_identity()
        note = request.json.get('note')

        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("INSERT INTO notes (user_id, note_text) VALUES (%s, %s) RETURNING id", (user_id, note))
                note_id = cursor.fetchone()[0]
                conn.commit()

        return jsonify({'message': 'Note added successfully', 'note_id': note_id}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# -------------------- Static Pages -------------------- #
@app.route('/signup_page')
def signup_page():
    error = request.args.get('error')
    return render_template('signup.html', error=error)


@app.route('/documentation')
def documentation():
    return render_template('documentation.html')


@app.route('/notes_page')
@jwt_required()
def notes_page():
    return render_template('notes.html')


@app.route('/ai_analysis')
@jwt_required()
def ai_analysis():
    return render_template('ai_analysis.html')

    
@app.route('/login_page')
def login_page():
    return render_template('login.html')

@app.route('/')
@app.route('/home')
def home():
    return render_template('index.html')


from app import app







