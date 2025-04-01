#!/bin/bash
waitress-serve --listen=0.0.0.0:$PORT api/index:app
