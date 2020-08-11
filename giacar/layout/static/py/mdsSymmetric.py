

"""
=========================
Multi-dimensional scaling
=========================
"""
print(__doc__)


from sklearn.decomposition import PCA
import pandas as pd
import matplotlib.pyplot as plt
from sklearn import manifold
from sklearn.preprocessing import StandardScaler
import numpy as np
from sklearn.utils.validation import check_symmetric
import random

DEBUG = True
#Ramdom state
RS = random.randint(0,1000000)

# Make avg of year intervals if present e.g 2000-2010 => 2005 
def averize(str_interval):
    if("-" in str(str_interval)):
        splitted=str_interval.split("-")
        return int( int(splitted[0])+int(splitted[1])/2 )
    return str_interval

def prepare_csv():

    df = pd.read_csv("static/data/merged.csv")
    
    if(DEBUG):    df = df.iloc[0:20]

    print("Columns", df.columns)

    df['Ordered'] = df['Ordered'].str.replace('(','')
    df['Ordered'] = df['Ordered'].str.replace(')','')
    df['Ordered'] = df['Ordered'].str.replace('.','')
    df['Ordered'] = df["Ordered"].str.strip()
    df['Ordered'] = pd.to_numeric(df['Ordered'])

    df['Ordered year'] = df['Ordered year'].str.replace('(','')
    df['Ordered year'] = df['Ordered year'].str.replace(')','')

    df['Ordered year'] = pd.to_numeric(df['Ordered year'])

    # df = df.drops("Delivered year")q
    df["Delivered year"] =  df["Delivered year"].apply( averize )

    df['Delivered num.'] = df['Delivered num.'].str.replace('(','')
    df['Delivered num.'] = df['Delivered num.'].str.replace(')','')
    df['Delivered num.'] = pd.to_numeric(df['Delivered num.'])
    df["Delivered num."] = df["Delivered num."].fillna(0)
    df['Delivered num.'] = df['Delivered num.'].astype(int)

    print( df.groupby(["Supplier","Recipient"])['Delivered num.'].agg('sum').unstack(fill_value=0) )

    recs= set( df["Recipient"].unique() )
  
    #Adding missing recipients in supplier column
    for r in recs:
        if r not in df["Supplier"]:
            df=df.append({"Supplier":r}, ignore_index=True)


    sups= set( df["Supplier"].unique() )
    print("Sups",sups)
    print("Recs",recs)

    #print( set( df.loc[df["Supplier"]=="Australia"]["Recipient"] ) )
    
    for current in sups:
        for missing in sups:
            if( missing not in set( df.loc[df["Supplier"]==current]["Recipient"] ) ):
                df  = df.append([{"Supplier":current,"Recipient":missing}], ignore_index=True)
    #Adding missing suppliers in recipient column
    # for s in sups:
    #     if s not in df.loc[ df["Supplier"] == x ]["Recipient"]:
    #         #Recipient not present in Supplier column (0 values)
    #         for x in sups:
    #             df.loc[ df["Supplier"] == x ]["Recipient"] = r

    #states = np.concatenate(df["Supplier"].unique(),df["Recipient"].unique())
    df["Delivered num."] = df["Delivered num."].fillna(0)
    
    print(df)
    df = df.groupby(["Supplier","Recipient"])['Delivered num.'].agg('sum').unstack(fill_value=0) 
    print( df )

    df.to_csv('pca_counts_min.csv', index=True) 


def my_mds_plot():
    
    data = pd.io.parsers.read_csv(  #pandas handles in a better way
     'pca_counts.csv', 
     header="infer"         #the first row contains the recipiennts names
    )
    if(DEBUG):
        data = pd.io.parsers.read_csv(  #pandas handles in a better way
        'pca_counts_min.csv', 
        header="infer"         #the first row contains the recipiennts names
        ) 
        print("Data\n",  data  )

    dissM=data.values[:,1:] #the first column contains the suppliers names
    countries=data.values[:,0]

    #amax = np.amax(dissM)
    #dissM /= amax          #you can uncomment  these lines to plot MDS in a normalized 2D

    
    dissM = np.array(dissM, dtype=float)
    #Repair dissM which is not symmetric
    dissM = check_symmetric(dissM)  
    
    if(DEBUG): 
        print(dissM)
        with open("log.txt","w") as out:
            out.write("".join( [x for x in countries] ))
            out.write("\n".join( [str(x) for x in dissM] ))
        


    mds = manifold.MDS(n_components=2, n_init=20,metric=True ,max_iter=3000, eps=1e-9,dissimilarity="precomputed",random_state=RS)
    pos = mds.fit(dissM).embedding_
    stress=mds.fit(dissM).stress_

    plt.scatter(pos[:, 0], pos[:, 1], marker = 'o')
    for label, x, y in zip(countries, pos[:, 0], pos[:, 1]):
        plt.annotate(
            label,
            xy = (x, y), xytext = (-20, 20),
            textcoords = 'offset points', ha = 'right', va = 'bottom',
            bbox = dict(boxstyle = 'round,pad=0.3', fc = 'yellow', alpha = 0.1),
            arrowprops = dict(arrowstyle = '->', connectionstyle = 'arc3,rad=0'))

    plt.show()
    print(stress)



    # from sklearn import datasets
    # digits = datasets.load_digits()
    # print(digits)

    # tsne = manifold.TSNE(n_components=2,random_state=2).fit_transform(dissM)
    # plt.scatter(tsne,tsne,3, marker = 'o')
    # for label, x, y in zip(countries, pos[:, 0], pos[:, 1]):
    #     plt.annotate(
    #         label,
    #         xy = (x, y), xytext = (-20, 20),
    #         textcoords = 'offset points', ha = 'right', va = 'bottom',
    #         bbox = dict(boxstyle = 'round,pad=0.3', fc = 'yellow', alpha = 0.1),
    #         arrowprops = dict(arrowstyle = '->', connectionstyle = 'arc3,rad=0'))

    plt.show()


# # Standardizing the features

def main():
    # if(DEBUG): prepare_csv() # VERY SLOW
    my_mds_plot()
    # load dataset into Pandas DataFrame

    # # Separating out the target
    # y = df.loc[:,['Weapon description']].values
    # # Standardizing the features
    # x = StandardScaler().fit_transform(x)

    # pca = PCA(n_components=2)
    # principalComponents = pca.fit_transform(x)
    # principalDf = pd.DataFrame(data = principalComponents
    #              , columns = ['principal component 1', 'principal component 2'])

main()


