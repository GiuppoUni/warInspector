"""
==================================================

Multi-dimensional scaling Server

==================================================


dataset: city_name,ihabitants (in thousands)

We use the dissimilarity functions

        dissM[i][j]= abs(ihabitants[i]-ihabitants[j])/(ihabitants[i]+ihabitants[j])
        dissM[i][j]= abs (ihabitants[i]-ihabitants[j])
        dissM[i][j]=1-jaccard(name[i],name[j])
        dissM[i][j]=1-sameStart(name[i],name[j])
        
        


"""

print(__doc__)
import numpy as np
import pandas as pd
from sklearn import manifold
from numpy import dot
from numpy.linalg import norm

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



def MDSMain(year,country):

    data = pd.io.parsers.read_csv(
        'static/data/importNumbers1989-2018.csv' 
        )
    print(data.columns, data)
    if year!=None:
        d=data[str(year)] 
    else:
        d=data["2018"] 
    d=d.fillna(0)

    print( "\n\n",np.all(np.isfinite(d)), not np.any(np.isnan(d)))

    countries=data["Country"]

    print(d,type(d),countries)

    dissM1=np.zeros((len(data),len(data))) #creates a zeros dissM
    dissM2=np.zeros((len(data),len(data))) #creates a zeros dissM
    dissM3=np.zeros((len(data),len(data))) #creates a zeros dissM

    for i in range(len(d)):
        for j in range (len(d)):
            dissM1[i][j]= abs(d[i]-d[j])
            d_i=d[i] 
            d_j=d[j]
            if(d[i]+d[j]!= 0):
                dissM2[i][j]= abs (d[i]-d[j])/(d[i]+d[j])
            else:
                dissM2[i][j]= abs (d[i]-d[j])

            if( (d[i]+d[j]) !=0 ):
                dissM3[i][j]= abs (d[i]-d[j])/( (d[i]+d[j])*4 )
            else:
                dissM3[i][j]= abs (d[i]-d[j])

            


    mds = manifold.MDS(n_components=2, max_iter=300, eps=1e-9,
                    dissimilarity="precomputed")
    pos1 = mds.fit(dissM1).embedding_
    stress1 = mds.fit(dissM1).stress_
    pos2 = mds.fit(dissM2).embedding_
    stress2 = mds.fit(dissM2).stress_
    pos3 = mds.fit(dissM3).embedding_
    stress3 = mds.fit(dissM3).stress_

    s = 50

    fig1=plt.figure()
    plt.scatter(pos1[:, 0], pos1[:, 1], color='red',s=s, lw=0, label='d[i]-d[j]')
    for label, x, y in zip(countries, pos1[:, 0], pos1[:, 1]):
        plt.annotate(
            label,
            xy = (x, y), xytext = (-20, 20),
            textcoords = 'offset points', ha = 'right', va = 'bottom',
            bbox = dict(boxstyle = 'round,pad=0.3', fc = 'yellow', alpha = 0.5),
            arrowprops = dict(arrowstyle = '->', connectionstyle = 'arc3,rad=0'))
    plt.legend()   
    #plt.show()
    print("Stress 1:",stress1)

    fig2=plt.figure()
    plt.scatter(pos2[:, 0], pos2[:, 1], color='red',s=s, lw=0, label='d[i]-d[j]/(d[i]+d[j])')
    for label, x, y in zip(countries, pos2[:, 0], pos2[:, 1]):
        plt.annotate(
            label,
            xy = (x, y), xytext = (-20, 20),
            textcoords = 'offset points', ha = 'right', va = 'bottom',
            bbox = dict(boxstyle = 'round,pad=0.3', fc = 'yellow', alpha = 0.5),
            arrowprops = dict(arrowstyle = '->', connectionstyle = 'arc3,rad=0'))
    plt.legend()   
    #plt.show()
    print("Stress 2:",stress2)

    fig3=plt.figure() 
    plt.scatter(pos3[:, 0], pos3[:, 1], color='red',s=s, lw=0, label='abs (d[i]-d[j])/( (d[i]+d[j])/2 )')
    for label, x, y in zip(countries, pos3[:, 0], pos3[:, 1]):
        plt.annotate(
            label,
            xy = (x, y), xytext = (-20, 20),
            textcoords = 'offset points', ha = 'right', va = 'bottom',
            bbox = dict(boxstyle = 'round,pad=0.3', fc = 'yellow', alpha = 0.5),
            arrowprops = dict(arrowstyle = '->', connectionstyle = 'arc3,rad=0'))
        plt.legend()   
        #plt.show()
        print("Stress 3:",stress3)

    fig1InHtml=mpld3.fig_to_html(fig1)
    fig2InHtml=mpld3.fig_to_html(fig2)
    fig3InHtml=mpld3.fig_to_html(fig3)

    return fig1InHtml + fig2InHtml + fig3InHtml


@application.route("/main",methods=["GET","POST"])

#3. Define main code
@application.route("/",methods=["GET","POST"])
def homepage():
    print("--------------- In python doing stuff (1.5s)...")
    # time.sleep(1.5)
    print("--------------- Rendering index")


    CountryName = request.form.get('Country_field',DEFAULT_STATE)
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


    ''''
    Dummy html
    '''
    # fig=plt.figure()
    # plt.plot([3,1,4,1,5], 'ks-', mec='w', mew=5, ms=20)
    # plt.title("Test plot")
    # plt.close() # and this one
    # # mpld3.show()
    # figInHtml=mpld3.fig_to_html(fig)#,d3_url="https://cdnjs.cloudflare.com/ajax/libs/d3/4.2.2/d3.min.js")
    # print("--------------------",figInHtml)
    # return jsonify(data.CountryName,data.Year1,data.Year2,figInHtml)
    s =  MDSMain(year1,None) 
    print(s)
    return jsonify(data.CountryName,data.Year1,data.Year2,s)

if __name__ == "__main__":
    application.run(debug=True)



