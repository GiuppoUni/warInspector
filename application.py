"""
==================================================

            WarInspector web app
            
==================================================


"""

print(__doc__)
import numpy as np
import pandas as pd
from numpy import dot
from numpy.linalg import norm

from flask import Flask, flash, redirect, render_template, request, session, abort,send_from_directory,send_file,jsonify

import json


from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt


PCA_WIDTH="300"
PCA_HEIGHT="250"

GOOGLE_CHROME_PATH = '/app/.apt/usr/bin/google_chrome'
CHROMEDRIVER_PATH = '/app/.chromedriver/bin/chromedriver'

folder="static/data/"

# op = webdriver.ChromeOptions()
# op.add_argument('headless')
# driver = webdriver.Chrome('/usr/bin/chromedriver',options=op)
# driver = webdriver.Chrome(CHROMEDRIVER_PATH,options=op)

#1. Declare application
# application= Flask(__name__)
application= Flask(__name__,root_path=".",template_folder='.')

#2. Declare data stores
class DataStore():
    CountryName=None
    Year1=None
    Year2=None
data=DataStore()

'''
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
                dissM3[i][j]= abs (d[i]-d[j])/( (d[i]+d[j])/2 )
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
        plt.title("Absolute distance",color="white")
        plt.annotate(
            label,
            xy = (x, y), xytext = (-20, 20),
            textcoords = 'offset points', ha = 'right', va = 'bottom',
            bbox = dict(boxstyle = 'round,pad=0.3', fc = 'yellow', alpha = 0.5),
            arrowprops = dict(arrowstyle = '->', connectionstyle = 'arc3,rad=0'))
    
    # fig, ax = plt.subplots(1)
    # ax.tick_params(axis='x', colors="white")
    # ax.tick_params(axis='y', colors="white")
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
    # fig3InHtml=""

    return fig1InHtml + fig2InHtml + fig3InHtml
'''

'''
=========
PCA
=========
'''

def createDf(year1,year2,countries,features = ['IMPORT_TOTAL',"EXPORT_TOTAL", 'ARMY_TOTAL','REF_TOTAL', 'GDP_TOTAL', 'POP_TOTAL']):
    
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

  
    #countries list
    # df_countries = pd.read_csv(folder + "countriesAlpha3.csv")
    # df_countries["name"] = df_countries["name"].apply(lambda x: x.strip() )

    year_range=[year1]
    if(year2!=year1):
        year_range = list(range(year1,year2+1))
    year_range_str = ["Country Name","Country Code"] + [str(x) for x in year_range]
    print(year_range_str)




    df_imp = pd.read_csv(folder + "df_imp_clean.csv")
    
    print(df_imp) 
    df_mrgd_imp = df_imp.iloc[:,[0,-1,-2,-3,-4]] 
    df_mrgd_imp.rename(columns={"code3":"Country Code"}, inplace=True)
    # NOTE
    # Compute Mean for range of years 
    df_mrgd_imp["IMPORT_TOTAL"] = df_imp[year_range_str[2:]].mean(axis=1)
    df_arm["ARMY_TOTAL"] = df_arm[year_range_str[2:]].mean(axis=1)
    df_ref["REF_TOTAL"] = df_ref[year_range_str[2:]].mean(axis=1)
    df_gdp["GDP_TOTAL"] = df_gdp[year_range_str[2:]].mean(axis=1)
    df_pop["POP_TOTAL"] = df_pop[year_range_str[2:]].mean(axis=1)
    # print(df_arm)
    # print(df_ref)
    # print(df_gdp)

    # print("->",df_mrgd_imp)
    
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

    df_exp = pd.read_csv(folder + "df_exp_clean.csv")

    df_mrgd_imp["EXPORT_TOTAL"] = df_exp[year_range_str[2:]].mean(axis=1)

    df_mrgd_imp = pd.merge(df_mrgd_imp,
        df_mrgd_imp[["Country Name","Country Code","EXPORT_TOTAL"]],on=["Country Name","Country Code"])


    df_mrgd_imp['EXPORT_TOTAL'] = df_mrgd_imp.groupby(['Country Code'])['EXPORT_TOTAL_x'].transform('sum')
    df_mrgd_imp = df_mrgd_imp.drop_duplicates(subset=["Country Name","Country Code"])

    # print(df_mrgd_imp)
    return df_mrgd_imp


def pcaMain(year1=2016,year2=2019,countries=["ITA"],features = ['IMPORT_TOTAL',"EXPORT_TOTAL", 'ARMY_TOTAL','REF_TOTAL', 'GDP_TOTAL', 'POP_TOTAL']):


    df_mrgd  = createDf(year1,year2,countries)
    print(df_mrgd)
    print("Plotting",countries)
    def pca_plot(df):
        # df['target']= df["Country Name"].apply(lambda x: "selected" if x.strip() in selected
        #     else "not selected")
        # print(df)
        df = df.rename(columns={"Country Code":"target"})

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
        finalDf = pd.concat([finalDf, df[['Country Name']]], axis = 1)
        finalDf = pd.concat([finalDf, df[['IMPORT_TOTAL']]], axis = 1)
        finalDf = pd.concat([finalDf, df[['EXPORT_TOTAL']]], axis = 1)

        print(finalDf)


        fig = plt.figure(figsize = (8,8))
        ax = fig.add_subplot(1,1,1) 
        # ax.set_xlabel('Principal Component 1', fontsize = 15)
        # ax.set_ylabel('Principal Component 2', fontsize = 15)
        # ax.set_title('2 component PCA', fontsize = 20)
        colors = ['y', 'b']

        indicesToKeep = finalDf["target"].apply(lambda x: x in countries)



        indicesToKeep2 = ~ indicesToKeep
        pc1 = finalDf.loc[indicesToKeep2, 'principal component 1'].to_list()
        pc2 = finalDf.loc[indicesToKeep2, 'principal component 2'].to_list()
        names = finalDf.loc[indicesToKeep2, "target"].to_list()
        names2 = finalDf.loc[indicesToKeep2, "Country Name"].to_list()
        not_selected_labels = [False]*len(names)
        imp = finalDf.loc[indicesToKeep2, "IMPORT_TOTAL"].to_list()
        exp = finalDf.loc[indicesToKeep2, "EXPORT_TOTAL"].to_list()


        # print(finalDf)
        # No grid
        plt.grid(b=None)

        ax.scatter( pc1, pc2 
                , c = "b"
                , s = 10)

        ax.grid()
        # non targets:
        for i,r in enumerate(zip(names, pc1, pc2)):
            if( pc1[i] > 0.2 and pc2[i] > 0.2):
                ax.annotate(r[0], (pc1[i]+0.1, pc2[i]+0.1 ))

        pc1Sel = finalDf.loc[indicesToKeep, 'principal component 1'].to_list()
        pc2Sel = finalDf.loc[indicesToKeep, 'principal component 2'].to_list()
        namesSel = finalDf.loc[indicesToKeep, "target"].to_list()
        namesSel2 = finalDf.loc[indicesToKeep, "Country Name"].to_list()
        selected_labels = [True]*len(namesSel)
        impSel = finalDf.loc[indicesToKeep, "IMPORT_TOTAL"].to_list()
        expSel = finalDf.loc[indicesToKeep, "EXPORT_TOTAL"].to_list()
        
        print("MAX",finalDf['IMPORT_TOTAL'].max(),finalDf['EXPORT_TOTAL'].max())
        
        scatter = ax.scatter( pc1Sel, pc2Sel 
                , c = "y"
                , s = 10,edgecolors='r')
        for i,r in enumerate(zip(namesSel, pc1Sel, pc2Sel)):
            ax.annotate(r[0], (pc1Sel[i]+0.1, pc2Sel[i]+0.1 ))

        # ax.legend( scatter,title="Selected:", labels=countries)
        
        print(namesSel)
        # plt.show()

        print("pca.explained_variance_ratio_",pca.explained_variance_ratio_)

        # Prepare data for d3

        return [list(zip(pc1,pc2,names,names2,not_selected_labels,imp,exp))
        +list(zip(pc1Sel,pc2Sel,namesSel,namesSel2,selected_labels,impSel,expSel))]

    data_imp = pca_plot(df_mrgd)

    return data_imp




# /**********
#  * ROUTES *
#  **********/
    

@application.route("/main",methods=["GET","POST"])

#3. Define main code
@application.route("/",methods=["GET","POST"])
def homepage():
    print("--------------- In python doing stuff (1.5s)...")
    # time.sleep(1.5)
    print("--------------- Rendering index")

    # CountryName = request.form.get('Country_field',DEFAULT_STATE)
    # Year1 = request.form.get('Year_field1', DEFAULT_YEARS[0])
    # Year2 = request.form.get('Year_field2', DEFAULT_YEARS[1])

    # data.CountryName=CountryName
    # data.Year1=Year1
    # data.Year2=Year2
    
    return render_template("index.html")
    # return render_template("myIndex.html")


@application.route("/get-data",methods=["POST"])
def returnPCAData():

    print("[S] Received request for pca")
    json_data=request.data 
    # print(json_data)
    parsed_json = (json.loads(json_data))
    # print(parsed_json["country"])

    country = parsed_json['country']
    year1 =  parsed_json['year1']
    year2 = parsed_json['year2']
    features = parsed_json["features"]
    print("[S] Params:",year1,year2,country)



    #s =  MDSMain(year1,None) 
    # s1,s2 = PCAMain(year1,year2, country )

    # old_dimensions_string = '"width": 800.0, "height": 800.0'
    # new_dimensions_string = '"width":' + PCA_WIDTH + ',"height":' + PCA_HEIGHT
    
    # s1 = s1.replace("<style>","").replace("</style>","")\
    # .replace(old_dimensions_string,new_dimensions_string)
    
    # s2 = s2.replace("<style>","").replace("</style>","")\
    # .replace(old_dimensions_string,new_dimensions_string)

    # #print(s)
    # return jsonify(data.CountryName,data.Year1,data.Year2,s1,s2)

    data_to_d3 = pcaMain(year1,year2,country,features)
    
    
    # link = driver.find_element_by_xpath('//*[@class="gct-alerts__latest-alert"]')
    # link.click()
    # alerts = []
    # dates = []
    # for a in soup.findAll('div', attrs={'class':'gct-alerts__alert-body gct-alerts__alert-body--all'}):
    #     alerts.append(a)
    # for d in soup.findAll('span', attrs={'class':'gct-alerts__alert-date gct-alerts__alert-date--all'}):
    #     dates.append(d)

    return jsonify(data.CountryName,data.Year1,data.Year2,data_to_d3 )

@application.route("/get-news",methods=["POST"])
def returnNews():
    # oldlink = "https://www.cfr.org/global-conflict-tracker/?category=us&conflictType=1099&vm=grid"
    # link = "https://www.crisisgroup.org/crisiswatch"
    # driver.get(link)
    # content = driver.page_source
    # soup = BeautifulSoup(content,"html.parser")
    # # alert = soup.find('span', attrs={'class':'gct-alerts__latest-alert'})
    # alert_parent = soup.find('p', attrs={'class':'[ u-mar-b0 u-mar-t15 ] [ u-fs13 u-lh15 u-fwl u-c-white:link ]'})
    # alert = alert_parent.findAll('a', attrs={'class':'js-scrollTo'})
    # # if(alert.text=="..."):
    # #     driver.get(link)
    # #     content = driver.page_source
    # #     soup = BeautifulSoup(content,"html.parser")

    # last_update_parent = soup.find('h3', attrs={'class':'[ u-fs12 ]'})
    # last_update = last_update_parent.find('span')
    # country_array = [a.text for a in alert] 
    # print(alert,last_update)
    # alert = str(alert).replace(",",", ").replace("[","").replace("]","").replace('href="/crisiswatch#','href="https://www.crisisgroup.org/crisiswatch#')
    return jsonify("",str("No news available"))
# Other routes
@application.route('/about')
def about():
    return render_template('static/html/about.html')

@application.route('/weapons')
def weapons():
    return render_template('static/html/weapons.html')

@application.route('/countries')
def countries():
    return render_template('static/html/countries.html')


if __name__ == "__main__":
    application.run(debug=True)



