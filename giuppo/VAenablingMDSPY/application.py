from flask import Flask, flash, redirect, render_template, request, session, abort,send_from_directory,send_file,jsonify
import pandas as pd

import json
import time
import matplotlib.pyplot as plt, mpld3


DEFAULT_YEARS = [2016,2019]
DEFAULT_STATE = "France"


#1. Declare application
# application= Flask(__name__)
application= Flask(__name__,root_path=".",template_folder='.')

#2. Declare data stores
class DataStore():
    CountryName=None
    Year1=None
    Year2=None
    Prod= None
    Loss=None
data=DataStore()


@application.route("/main",methods=["GET","POST"])

#3. Define main code
@application.route("/",methods=["GET","POST"])
def homepage():
    print("--------------- In python doing stuff (1.5s)...")
    # time.sleep(1.5)
    print("--------------- Rendering index")

    CountryName = request.form.get('Country_field','India')
    Year1 = request.form.get('Year_field1', DEFAULT_YEARS[0])
    Year2 = request.form.get('Year_field2', DEFAULT_YEARS[1])

    data.CountryName=CountryName
    data.Year1=Year1
    data.Year2=Year2
    
    data.Prod=[1,2]
    data.Loss=[3,4]

    return render_template("myIndex.html",CountryName=CountryName,Year1=Year1,Year2=Year2,Prod=data.Prod,Loss=data.Loss)


@application.route("/get-data",methods=["GET","POST"])
def returnProdData():

    json_data=request.data 
    # print(json_data)
    parsed_json = (json.loads(json_data))
    # print(parsed_json["country"])

    country = parsed_json['country']
    year1 =  parsed_json['year1']
    year2 = parsed_json['year2']


    print(country,year1,year2)


    print("-------------- Simulating mds...")
    
    # time.sleep(3)
    
    fig=plt.figure()
    plt.plot([3,1,4,1,5], 'ks-', mec='w', mew=5, ms=20)
    plt.title("Test plot")
    plt.close() # and this one
    # mpld3.show()
    figInHtml=mpld3.fig_to_html(fig)#,d3_url="https://cdnjs.cloudflare.com/ajax/libs/d3/4.2.2/d3.min.js")
    print("--------------------",figInHtml)
    return jsonify(data.CountryName,data.Year1,data.Year2,figInHtml)
# export the final result to a json file

# @application.route("/get-loss-data",methods=["GET","POST"])
# def returnLossData():
#     g=data.Loss

#     return jsonify(g)


if __name__ == "__main__":
    application.run(debug=True)



