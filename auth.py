from flask import Blueprint, request, jsonify, current_app
from flask_cors import cross_origin
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token
from models import User, db
import random, traceback, os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")
FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "noreply@lion-swap.com")

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
@cross_origin(origin=["https://lion-swap.com", "https://www.lion-swap.com"],
              supports_credentials=True)
def login():
    try:
        username = request.json.get("username")
        password = request.json.get("password")
        if not username or not password:
            return jsonify({"error": "Username and Password are required"}), 400

        user = User.query.filter_by(username=username).first()
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({"error": "Invalid username or password"}), 401

        token = create_access_token(identity=str(user.id))
        return jsonify({"message": "Login Successful", "token": token}), 201

    except Exception as e:
        current_app.logger.exception("💥 login crashed")
        resp = jsonify({"error": str(e)})
        resp.headers["Access-Control-Allow-Origin"] = "https://www.lion-swap.com"
        resp.headers["Access-Control-Allow-Credentials"] = "true"
        return resp, 500


@auth_bp.route('/confirm_credentials', methods=['POST'])
def confirm_credentials():
    try:
        username = request.json.get("username")
        email = request.json.get("email")
        password = request.json.get("password")
        phone = request.json.get("phone")

        if not email.endswith("@columbia.edu") and not email.endswith("@barnard.edu"):
            return jsonify({"error": "Email must be @columbia.edu or @barnard.edu"}), 401

        if not username or not password or not email:
            return jsonify({"error": "Username, Email, and Password are required"}), 402

        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Username is already taken"}), 403
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email is already taken"}), 404
        if User.query.filter_by(phone=phone).first():
            return jsonify({"error": "Phone number is already taken"}), 405

        passcode = random.randint(100000, 999999)
        disclaimer = (
            "LionSwap will never email you and ask you to disclose or verify your password, "
            "credit card, or banking account number. If you receive a suspicious email with a link to "
            "update your account information, do not click on the link. Instead, report the e-mail "
            "to LionSwap for investigation."
        )
        send_email(email, "LionSwap Account Verification", f"Here is your passcode: {passcode}\n\n{disclaimer}")

        return jsonify({"message": "Confirmed Credentials", "passcode": passcode}), 201

    except Exception:
        tb = traceback.format_exc()
        current_app.logger.error(f"🛑 signup error:\n{tb}")
        return jsonify({"error": "Internal server error", "trace": tb}), 500


@auth_bp.route('/signup', methods=['POST'])
def signup():
    username = request.json.get("username")
    email = request.json.get("email")
    password = request.json.get("password")
    phone = request.json.get("phone")

    hashed_password = generate_password_hash(password)
    user = User(username=username, email=email, phone=phone, password_hash=hashed_password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"message": "Signup Successful", "token": token}), 201


def send_email(to, subject, body):
    resend.Emails.send({
        "from": FROM_EMAIL,
        "to": [to],
        "subject": subject,
        "text": body,
    })
