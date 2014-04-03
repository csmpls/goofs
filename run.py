#!bin/python
from app import app
import praw

SECRET_KEY = 'a555c33332'
app.secret_key = SECRET_KEY
app.run(host='128.32.226.246', port=4201, debug = True)
