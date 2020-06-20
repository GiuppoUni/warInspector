'''
=========
PCA
=========
'''

import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt, mpld3


year1=1990
year2=2018
country="France"

folder="../data/"

all_years = [str(x) for x in range(1950,2020) ]


#refugees
df_ref = pd.read_csv(folder+"ref.csv", header=4 )
df_ref = df_ref.rename(columns=lambda x: x.strip())

#population
df_pop = pd.read_csv(folder + "pop.csv", header=4)
df_pop = df_pop.rename(columns=lambda x: x.strip())

#army
df_arm = pd.read_csv(folder +  "army-dimensions.csv", header=4)
df_arm = df_arm.rename(columns=lambda x: x.strip())

#gdp
df_gdp = pd.read_csv(folder +  "gdp.csv", header=4)
df_gdp = df_gdp.rename(columns=lambda x: x.strip())

#import def
df_imp = pd.read_csv(folder +  "imp.csv", header=10)

#export def
df_exp = pd.read_csv(folder +  "exp.csv", header=10)

#countries list
df_countries = pd.read_csv(folder + "countriesAlpha3.csv")
df_countries["name"]=df_countries["name"].apply(lambda x: x.strip() )

year_range=[year1]
if(year2!=year1):
    year_range = list(range(year1,year2+1))
year_range_str = ["Country Name","Country Code"] + [str(x) for x in year_range]
print(year_range_str)





# Searching for unidentified countries
# print("Printing missing in exp:")
# year_range = ["Country Name"]+year_range[1:]
# year_range_str=[str(x) for x in year_range]
# for c in df_exp[year_range_str].dropna(subset=year_range_str[1:])["Country Name"].to_numpy():
#     found=False
#     for cc in df_countries["name"].to_numpy():
#         if(str(c).strip()==str(cc).strip()): 
#             found = True
#     if( not found):
#         print(c)

# print("Printing missing in imp:")
# year_range=["Country Name"]+year_range[1:]
# year_range_str=[str(x) for x in year_range]
# for c in df_exp[year_range_str].dropna(subset=year_range_str[1:])["Country Name"].to_numpy():
#     found=False
#     for cc in df_countries["name"].to_numpy():
#         if(str(c).strip()==str(cc).strip()): 
#             found = True
#     if( not found):
#         print(c)

# Merging with alpha3 Countries
# df_imp = df_imp.merge(df_countries,left_on="Country Name",right_on="name")
# df_imp[all_years] = df_imp.groupby(['code3'])[all_years].transform('sum')
df_imp = pd.read_csv("df_imp_clean.csv")


df_mrgd_imp = df_imp.iloc[:,[0,-1,-2,-3,-4]] 
df_mrgd_imp.rename(columns={"code3":"Country Code"}, inplace=True)


# Compute Mean for range of years 
df_mrgd_imp["IMPORT_TOTAL"] = df_imp[year_range_str[2:]].mean(axis=1)
df_arm["ARMY_TOTAL"] = df_arm[year_range_str[2:]].mean(axis=1)
df_ref["REF_TOTAL"] = df_ref[year_range_str[2:]].mean(axis=1)
df_gdp["GDP_TOTAL"] = df_gdp[year_range_str[2:]].mean(axis=1)
df_pop["POP_TOTAL"] = df_pop[year_range_str[2:]].mean(axis=1)

# Merging for final IMP
df_mrgd_imp = pd.merge(df_mrgd_imp,
    df_mrgd_imp[["Country Name","Country Code","IMPORT_TOTAL"]],on=["Country Name","Country Code"])

df_mrgd_imp['IMPORT_TOTAL'] = df_mrgd_imp.groupby(['Country Code'])['IMPORT_TOTAL_x'].transform('sum')
df_mrgd_imp = df_mrgd_imp.drop_duplicates(subset=["Country Name","Country Code"])


df_mrgd_imp = pd.merge(df_mrgd_imp,
    df_arm[["Country Code","ARMY_TOTAL"]],on="Country Code")
df_mrgd_imp['ARMY_TOTAL'] = df_mrgd_imp.groupby(['Country Code'])['ARMY_TOTAL'].transform('sum')
df_mrgd_imp = df_mrgd_imp.drop_duplicates(subset=["Country Name","Country Code"])


df_mrgd_imp = pd.merge(df_mrgd_imp,
    df_ref[["Country Code","REF_TOTAL"]],on="Country Code")
df_mrgd_imp['REF_TOTAL'] = df_mrgd_imp.groupby(['Country Code'])['REF_TOTAL'].transform('sum')
df_mrgd_imp = df_mrgd_imp.drop_duplicates(subset=["Country Name","Country Code"])

df_mrgd_imp = pd.merge(df_mrgd_imp,
    df_gdp[["Country Code","GDP_TOTAL"]],on="Country Code")
df_mrgd_imp['GDP_TOTAL'] = df_mrgd_imp.groupby(['Country Code'])['GDP_TOTAL'].transform('sum')
df_mrgd_imp = df_mrgd_imp.drop_duplicates(subset=["Country Name","Country Code"])

df_mrgd_imp = pd.merge(df_mrgd_imp,
    df_pop[["Country Code","POP_TOTAL"]],on="Country Code")
df_mrgd_imp['POP_TOTAL'] = df_mrgd_imp.groupby(['Country Code'])['POP_TOTAL'].transform('sum')
df_mrgd_imp = df_mrgd_imp.drop_duplicates(subset=["Country Name","Country Code"])

# Merging for final EXP
# df_exp = df_exp.merge(df_countries,left_on="Country Name",right_on="name")
# df_exp[all_years] = df_exp.groupby(['code3'])[all_years].transform('sum')
df_exp = pd.read_csv("df_exp_clean.csv")

df_mrgd_exp = df_exp.iloc[:,[0,-1,-2,-3,-4]] 
df_mrgd_exp.rename(columns={"code3":"Country Code"}, inplace=True)
df_mrgd_exp["EXPORT_TOTAL"] = df_exp[year_range_str[2:]].mean(axis=1)

df_mrgd_exp = pd.merge(df_mrgd_exp,
    df_mrgd_exp[["Country Name","Country Code","EXPORT_TOTAL"]],on=["Country Name","Country Code"])


df_mrgd_exp['EXPORT_TOTAL'] = df_mrgd_exp.groupby(['Country Code'])['EXPORT_TOTAL_x'].transform('sum')
df_mrgd_exp = df_mrgd_exp.drop_duplicates(subset=["Country Name","Country Code"])


df_mrgd_exp = pd.merge(df_mrgd_exp,
    df_arm[["Country Code","ARMY_TOTAL"]],on="Country Code")
df_mrgd_exp['ARMY_TOTAL'] = df_mrgd_exp.groupby(['Country Code'])['ARMY_TOTAL'].transform('sum')
df_mrgd_exp = df_mrgd_exp.drop_duplicates(subset=["Country Name","Country Code"])


df_mrgd_exp = pd.merge(df_mrgd_exp,
    df_ref[["Country Code","REF_TOTAL"]],on="Country Code")
df_mrgd_exp['REF_TOTAL'] = df_mrgd_exp.groupby(['Country Code'])['REF_TOTAL'].transform('sum')
df_mrgd_exp = df_mrgd_exp.drop_duplicates(subset=["Country Name","Country Code"])

df_mrgd_exp = pd.merge(df_mrgd_exp,
    df_gdp[["Country Code","GDP_TOTAL"]],on="Country Code")
df_mrgd_exp['GDP_TOTAL'] = df_mrgd_exp.groupby(['Country Code'])['GDP_TOTAL'].transform('sum')
df_mrgd_exp = df_mrgd_exp.drop_duplicates(subset=["Country Name","Country Code"])

df_mrgd_exp = pd.merge(df_mrgd_exp,
    df_pop[["Country Code","POP_TOTAL"]],on="Country Code")
df_mrgd_exp['POP_TOTAL'] = df_mrgd_exp.groupby(['Country Code'])['POP_TOTAL'].transform('sum')
df_mrgd_exp = df_mrgd_exp.drop_duplicates(subset=["Country Name","Country Code"])





# def pca_plot(df_input,selected=["France"]):
selected=["France"]
df = df_mrgd_imp
# df['target']= df["Country Name"].apply(lambda x: "selected" if x.strip() in selected
#     else "not selected")
df = df.rename(columns={"name":"target"})


features = ['IMPORT_TOTAL', 'ARMY_TOTAL',
    'REF_TOTAL', 'GDP_TOTAL', 'POP_TOTAL']
if("IMPORT_TOTAL" not in df.columns.values):
    features = ['EXPORT_TOTAL', 'ARMY_TOTAL',
    'REF_TOTAL', 'GDP_TOTAL', 'POP_TOTAL']
# Separating out the features
x = df.loc[:, features].values
# Separating out the target
y = df.loc[:,['target']].values
# Standardizing the features
x = StandardScaler().fit_transform(x)


pca = PCA(n_components=2)
principalComponents = pca.fit_transform(x)
principalDf = pd.DataFrame(data = principalComponents
            , columns = ['principal component 1', 'principal component 2'])
            

finalDf = pd.concat([principalDf, df[['target']]], axis = 1)



fig = plt.figure(figsize = (8,8))
ax = fig.add_subplot(1,1,1) 
ax.set_xlabel('Principal Component 1', fontsize = 15)
ax.set_ylabel('Principal Component 2', fontsize = 15)
ax.set_title('2 component PCA', fontsize = 20)
colors = ['y', 'b']

indicesToKeep = finalDf["target"].apply(lambda x: x in selected)



indicesToKeep2 = ~ indicesToKeep
pc1 = finalDf.loc[indicesToKeep2, 'principal component 1'].to_list()
pc2 = finalDf.loc[indicesToKeep2, 'principal component 2'].to_list()
names = finalDf.loc[indicesToKeep2, "target"].to_list()
ax.scatter( pc1, pc2 
        , c = "b"
        , s = 50)

ax.legend(selected)
ax.grid()
# non targets:
for i,r in enumerate(zip(names, pc1, pc2)):
    if( pc1[i] > 0.2 and pc2[i] > 0.2):
        ax.annotate(r[0], (pc1[i]+0.1, pc2[i]+0.1 ))

pc1 = finalDf.loc[indicesToKeep, 'principal component 1'].to_list()
pc2 = finalDf.loc[indicesToKeep, 'principal component 2'].to_list()
names = finalDf.loc[indicesToKeep, "target"].to_list()

ax.scatter( pc1, pc2 
        , c = "y"
        , s = 100)
for i,r in enumerate(zip(names, pc1, pc2)):
    ax.annotate(r[0], (pc1[i]+0.1, pc2[i]+0.1 ))

print(names)
plt.show()

print("pca.explained_variance_ratio_",pca.explained_variance_ratio_)

# pca_plot(df_mrgd_imp)
# pca_plot(df_mrgd_exp)
