from flask import Flask
from flask_restx import Api
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from config import Config
from app.api.v1.users import api as users_ns
from app.api.v1.amenities import api as amenities_ns
from app.api.v1.places import api as places_ns
from app.api.v1.reviews import api as reviews_ns
from app.api.v1.auth import api as auth_api
from app.api.v1.admin import api as admin_api

db = SQLAlchemy()
jwt = JWTManager()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hbnb_database.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config.from_object(Config)

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)


    api = Api(app, version='1.0', title='HBnB API', description='HBnB Application API')


    api.add_namespace(auth_api, path='app/api/v1/auth')
    api.add_namespace(users_ns, path='app/api/v1/users')
    api.add_namespace(places_ns, path='app/api/v1/places')
    api.add_namespace(reviews_ns, path='app/api/v1/reviews')
    api.add_namespace(amenities_ns, path='app/api/v1/amenities')
    api.add_namespace(admin_api, path='app/api/v1/admin')

    return app
