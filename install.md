In a new server which is vps or new system or a new instance we need to 
connect to server using terminal by typing
==========================================================================
 ssh (-p 25000) root@12.34.56.789 (-p is port..and ip address is your server ip adderess.)
 =========================================================================
1)to install curl and then python by using
==========================================================================
apt-get install curl (if you are in root dont use 'sudo' or else add 'sudo' to the command)
apt-get install python
2)and we need to install pip and python developer tools
===========================================================================
sudo apt-get install build-essential python-dev
sudo apt-get install python-pip
sudo apt-get install virtualenv
 
create virtualenv
==================
virtualenv venv

activate virtualenv
==================
goto venv folder then type: source bin/activate

pip install PyJwt

pip install eve

pip install nltk==2.0.5

pip install requests

install mongodb by following link

http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/
create mongouser by following way

db.createUser({
 user: "test",
  pwd: "test",

  roles: [
    { role: "dbAdmin", db: "test" },
  ]
})

pip install loremipsum


then after download all nltk  packages by following way
goto pythonn console.

>> import nltk
>> nltk.download('all')


pip install numpy

install instructions for chat socketio
=======================================
Flask-SocketIO

Werkzeug==0.9.4

gevent==1.0

gevent-socketio==0.3.6

gevent-websocket==0.9.2

greenlet==0.4.2

ujson==1.33
