#!/bin/bash
echo "Installing dependencies..."
pip install --upgrade pip setuptools wheel

echo "Installing project requirements..."
pip install -r requirements.txt

echo "Build completed!"
