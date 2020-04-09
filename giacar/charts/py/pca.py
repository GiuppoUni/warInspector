from sklearn.preprocessing import StandardScaler
import pandas as pd
import csv

path = "../data/merged.csv" 

# load dataset into Pandas DataFrame

with open(path, 'r') as f:
    d_reader = csv.DictReader(f)

    #get fieldnames from DictReader object and store in list
    headers = d_reader.fieldnames

print(headers)

df = pd.read_csv(path)

print(df)

# Remove useless features
df = df.drop(['latS', 'longS', 'latR', 'longR', 'Comments'], axis=1)

print(df)

features = headers
features.remove('latS')
features.remove('longS')
features.remove('latR')
features.remove('longR')
features.remove('Comments')

print(features)

# Correct integer values
for i in df.shape[0]:
    el = df.loc[i, 'Ordered'].strip('() ')
    if len(el) >= 0:
        df.loc[i, 'Ordered'] = int(el)
    else:
        df.loc[i, 'Ordered'] = 0
    
    el = df.loc[i, 'Delivered num.'].strip('() ')
    if len(el) >= 0:
        df.loc[i, 'Delivered num.'] = int(el)
    else:
        df.loc[i, 'Delivered num.'] = 0

    el = df.loc[i, 'Delivered year'].strip('() ')
    if len(el) >= 0:
        df.loc[i, 'Delivered year'] = int(el)
    else:
        df.loc[i, 'Delivered year'] = 0


# Quantization of some features




# Separating out the features
x = df.loc[:, features].values

"""
# Separating out the target
y = df.loc[:,['target']].values

# Standardizing the features
x = StandardScaler().fit_transform(x)
"""
