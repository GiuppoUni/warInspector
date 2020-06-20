import pandas as pd
import csv


years= [str(x) for x in list(range(1950,1989)) ]

df_exp = pd.read_csv("../data/df_exp_clean.csv")
df_imp = pd.read_csv("../data/df_imp_clean.csv")

df_exp =  df_exp.drop(columns=years+["Total","country",	"latitude"	,"longitude",	"name"	])

df_imp = df_imp.drop(columns=years+["Total","country",	"latitude"	,"longitude",	"name"	])

rk_imp = df_imp.melt(id_vars=["Country Name", "code3"], 
        var_name="Date", 
        value_name="Value")



rk_imp = rk_imp.rename(columns={"Value":"value"} )
rk_imp = rk_imp.rename(columns={"Date":"year"} )
rk_imp = rk_imp.rename(columns={"Country Name":"name"} )
rk_imp = rk_imp.sort_values(by=["name","year"])

rk_imp = rk_imp.reset_index(drop=True)

rk_imp["rank"] = rk_imp.groupby(by="year")["value"].rank("dense", ascending=False)

for i in range(1, len(rk_imp)):
    if(rk_imp.loc[i, 'year']!="1989"):
        rk_imp.loc[i, 'lastValue'] = rk_imp.loc[i-1, 'value'] 

rk_imp = rk_imp[['name', 'value', 'year', 'lastValue', 'rank','code3' ]]
rk_imp = rk_imp.fillna(0)
rk_imp.to_csv("rk_imp.csv",index=False)

# exp
rk_exp = df_exp.melt(id_vars=["Country Name", "code3"], 
        var_name="Date", 
        value_name="Value")
rk_exp = rk_exp.rename(columns={"Value":"value"} )
rk_exp = rk_exp.rename(columns={"Date":"year"} )
rk_exp = rk_exp.rename(columns={"Country Name":"name"} )
rk_exp = rk_exp.sort_values(by=["name","year"])

rk_exp = rk_exp.reset_index(drop=True)

rk_exp["rank"] = rk_exp.groupby(by="year")["value"].rank("dense", ascending=False)

for i in range(1, len(rk_exp)):
    if(rk_exp.loc[i, 'year']!="1989"):
        rk_exp.loc[i, 'lastValue'] = rk_exp.loc[i-1, 'value'] 
    else:
        rk_exp.loc[i, 'lastValue'] = rk_exp.loc[i, 'value'] 


rk_exp=rk_exp[['name', 'value', 'year', 'lastValue', 'rank','code3' ]]
rk_exp = rk_exp.fillna(0)

# rk_exp = rk_exp.iloc[0:100]
# rk_exp2 = pd.DataFrame(columns=['name', 'value', 'year', 'lastValue', 'rank' ])
# for i in range(1,len(rk_exp)):
#     row= rk_exp.iloc[i]
#     for j in range(1,10):
#         new_row = row.copy()
#         new_row["year"] +=  "." + str(j)
#         rk_exp = rk_exp.append(new_row,ignore_index=True)

# rk_exp = pd.concat([rk_exp,rk_exp2])
# rk_exp = rk_exp.sort_values(by=["name","year"])
rk_exp.to_csv("rk_exp.csv",index=False)
