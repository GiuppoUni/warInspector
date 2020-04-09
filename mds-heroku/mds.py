"""
=========================
Multi-dimensional scaling
=========================

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
from matplotlib import pyplot as plt
from sklearn import manifold
import math
from numpy import dot
from numpy.linalg import norm
from datetime import datetime

def make_mds(chosen_year) :

    def jaccard(s1,s2):
        u=set(s1.lower()).union(set(s2.lower()))
        i=set(s1.lower()).intersection(set(s2.lower()))
        return(len(i)/len(u))

    def samePosition(s1,s2):
        tot=0
        for i in range( min(len(s1),len(s2))):
            if s1[i]==s2[i]:
                tot+=1
        return(tot/min(len(s1),len(s2)))

    def sameStart(s1,s2):
        tot=0
        i=0
        while i <( min(len(s1),len(s2))) and s1[i]==s2[i]:
                i+=1
        return(i/min(len(s1),len(s2)))

    data = pd.io.parsers.read_csv(
        './data/importNumbers2000-2018.csv' 
        )
    print(data.columns, data)
    d=data[chosen_year] 
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

            if( norm(d[i])*norm(d[j]) !=0):
                dissM3[i][j]=cos_sim = dot(d[i], d[j])/(norm(d[i])*norm(d[j]))
            else:
                dissM3[i][j]=cos_sim = dot(d[i], d[j])

            


    mds = manifold.MDS(n_components=2, max_iter=300, eps=1e-9,
                    dissimilarity="precomputed")
    pos1 = mds.fit(dissM1).embedding_
    pos2 = mds.fit(dissM2).embedding_
    pos3 = mds.fit(dissM3).embedding_
    s = 50

    plt.scatter(pos1[:, 0], pos1[:, 1], color='red',s=s, lw=0, label='d[i]-d[j]')
    for label, x, y in zip(countries, pos1[:, 0], pos1[:, 1]):
        plt.annotate(
            label,
            xy = (x, y), xytext = (-20, 20),
            textcoords = 'offset points', ha = 'right', va = 'bottom',
            bbox = dict(boxstyle = 'round,pad=0.3', fc = 'yellow', alpha = 0.5),
            arrowprops = dict(arrowstyle = '->', connectionstyle = 'arc3,rad=0'))
    plt.legend()  
    # plt.show() 
    filename1 = "Plot_1_"+datetime.now().strftime("%Y-%m-%d_%H:%M:%S")
    plt.savefig("images/"+filename1+".png")


    plt.scatter(pos2[:, 0], pos2[:, 1], color='red',s=s, lw=0, label='d[i]-d[j]/(d[i]+d[j])')
    for label, x, y in zip(countries, pos2[:, 0], pos2[:, 1]):
        plt.annotate(
            label,
            xy = (x, y), xytext = (-20, 20),
            textcoords = 'offset points', ha = 'right', va = 'bottom',
            bbox = dict(boxstyle = 'round,pad=0.3', fc = 'yellow', alpha = 0.5),
            arrowprops = dict(arrowstyle = '->', connectionstyle = 'arc3,rad=0'))
    plt.legend()   
    # plt.show()
    filename2 = "Plot_2_"+datetime.now().strftime("%Y-%m-%d_%H:%M:%S")
    plt.savefig("images/"+filename2+".png")

    plt.scatter(pos3[:, 0], pos3[:, 1], color='red',s=s, lw=0, label='abs(math.log10(d[i])-math.log10(d[j])')
    for label, x, y in zip(countries, pos3[:, 0], pos3[:, 1]):
        plt.annotate(
            label,
            xy = (x, y), xytext = (20, 20),
            textcoords = 'offset points', ha = 'right', va = 'bottom',
            bbox = dict(boxstyle = 'round,pad=0.3', fc = 'yellow', alpha = 0.5),
            arrowprops = dict(arrowstyle = '->', connectionstyle = 'arc3,rad=0'))
    plt.legend()   
    # plt.show()
    filename3 = "Plot_3_"+datetime.now().strftime("%Y-%m-%d_%H:%M:%S")
    plt.savefig("images/"+filename3+".png")

    return [filename1, filename2, filename3]