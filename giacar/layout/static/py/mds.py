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
from numpy import dot
from numpy.linalg import norm


def MDSMain():

    data = pd.io.parsers.read_csv(
        'static/data/importNumbers1989-2018.csv' 
        )
    print(data.columns, data)
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

    plt.scatter(pos1[:, 0], pos1[:, 1], color='red',s=s, lw=0, label='d[i]-d[j]')
    for label, x, y in zip(countries, pos1[:, 0], pos1[:, 1]):
        plt.annotate(
            label,
            xy = (x, y), xytext = (-20, 20),
            textcoords = 'offset points', ha = 'right', va = 'bottom',
            bbox = dict(boxstyle = 'round,pad=0.3', fc = 'yellow', alpha = 0.5),
            arrowprops = dict(arrowstyle = '->', connectionstyle = 'arc3,rad=0'))
    plt.legend()   
    plt.show()
    print("Stress 1:",stress1)

    plt.scatter(pos2[:, 0], pos2[:, 1], color='red',s=s, lw=0, label='d[i]-d[j]/(d[i]+d[j])')
    for label, x, y in zip(countries, pos2[:, 0], pos2[:, 1]):
        plt.annotate(
            label,
            xy = (x, y), xytext = (-20, 20),
            textcoords = 'offset points', ha = 'right', va = 'bottom',
            bbox = dict(boxstyle = 'round,pad=0.3', fc = 'yellow', alpha = 0.5),
            arrowprops = dict(arrowstyle = '->', connectionstyle = 'arc3,rad=0'))
    plt.legend()   
    plt.show()
    print("Stress 2:",stress2)


    plt.scatter(pos3[:, 0], pos3[:, 1], color='red',s=s, lw=0, label='abs (d[i]-d[j])/( (d[i]+d[j])/2 )')
    for label, x, y in zip(countries, pos3[:, 0], pos3[:, 1]):
        plt.annotate(
            label,
            xy = (x, y), xytext = (-20, 20),
            textcoords = 'offset points', ha = 'right', va = 'bottom',
            bbox = dict(boxstyle = 'round,pad=0.3', fc = 'yellow', alpha = 0.5),
            arrowprops = dict(arrowstyle = '->', connectionstyle = 'arc3,rad=0'))
        plt.legend()   
        plt.show()
        print("Stress 3:",stress3)

