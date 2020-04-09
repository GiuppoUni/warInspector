from flask import Flask, request, jsonify
from mds import make_mds
import base64
import os

app = Flask(__name__)

port = int(os.environ.get('PORT', 5000))

def encodeImage(filename):
    encoded_string = ""
    with open("./images/"+filename+".png", "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read())
    return encoded_string

@app.route('/mds', methods=['GET'])
def post_result():
    param = request.args.get('year')
    print(param)
    if param and str(param).isdigit():
        res = make_mds(str(param))
        return jsonify({
            "Status": "success",
            "Result": {
                "Plot1": encodeImage(res[0]),
                "Plot2": encodeImage(res[1]),
                "Plot3": encodeImage(res[2])
            }
        }), 200
    else:
        return jsonify({
            "Status": "failure",
            "ERROR": "no year found, please send an year."
        }), 401

# A welcome message to test our server
@app.route('/')
def index():
    return "<h1>Welcome to mds server !!!</h1>"

if __name__ == '__main__':
    # Threaded option to enable multiple instances for multiple user access support
    app.run(threaded=True, port=port)
