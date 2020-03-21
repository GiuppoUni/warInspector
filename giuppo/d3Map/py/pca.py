from sklearn.decomposition import PCA


import pandas as pd



""" Make avg of year intervals if present e.g 2000-2010 => 2005 """
def averize(str_interval):
    if("-" in str(str_interval)):
        splitted=str_interval.split("-")
        return int( int(splitted[0])+int(splitted[1])/2 )
    return str_interval

def main():
    # load dataset into Pandas DataFrame
    df = pd.read_csv("../data/merged.csv")


    from sklearn.preprocessing import StandardScaler

    print(df.columns)
    print(df.dtypes)
    features = ['Supplier', 'Recipient', 'Ordered', 'Designation num.',
        'Weapon description', 'Ordered year', 'Delivered year',
        'Delivered num.', 'Comments', 'latS', 'longS', 'codeS', 'latR', 'longR',
        'codeR']
        
    # # Separating out the features
    x = df.loc[:, features].values
    # # Separating out the target
    y = df.loc[:,['Weapon description']].values

    df['Ordered'] = df['Ordered'].str.replace('(','')
    df['Ordered'] = df['Ordered'].str.replace(')','')

    df['Ordered year'] = df['Ordered year'].str.replace('(','')
    df['Ordered year'] = df['Ordered year'].str.replace(')','')


    df['Delivered num.'] = df['Delivered num.'].str.replace('(','')
    df['Delivered num.'] = df['Delivered num.'].str.replace(')','')

    # df = df.drops("Delivered year")
    df["Delivered year"] =  df["Delivered year"].apply( averize )

    print(df)
    # # Standardizing the features
    x = StandardScaler().fit_transform(x)


    # pca = PCA(n_components=2)
    # principalComponents = pca.fit_transform(x)
    # principalDf = pd.DataFrame(data = principalComponents
    #              , columns = ['principal component 1', 'principal component 2'])


main()