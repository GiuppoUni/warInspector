import csv
import re

def createCountryCSV():
    print("creating csv for countries...")
    cf=open("static/data/countries-clean.txt","r")
    csv=open("static/data/countries.csv","w")
    
    for line in cf:
        cc=0
        for i,c in enumerate(line):
            if(cc<3 and c=="\t" and line[i+1]!=c ):
                cc+=1
                c=", "
            csv.write(c)
    csv.close()            


def main():
    #check if trade....csv and countries.csv names match
     
    #createCountryCSV()

    tf=open("static/data/Trade-Register-2010-2018.csv","r") #file1
    
    regex = re.compile('[^a-zA-Z]')
    countries=[]
    for line in tf:
        s=" ".join(line.split(",")[0].split() )
        s=regex.sub("",s)
        r=" ".join(line.split(",")[1].split() )
        r=regex.sub("",r)
        if(r==""):
            print("WRONG R: ",r) 
        if(r==""):
            print("WRONG S: ",s)
        if(s not in countries):
            countries.append(s)
        if(r not in countries):
            countries.append(r)
    #print(countries)
    tf.close()

    
    for c in countries:
        cf=open("static/data/countries.csv","r") #file2
        
        found=False
        for line2 in cf:
            name= regex.sub("",   " ".join( ( line2.split(",")[-1] ).split() ) )
            #print(c,name,c==name)
            if (c==name):
                print("Found",c)
                found=True
                countries.remove(c)
                break;
    
        cf.close()
        if(found):
            continue

        cf=open("static/data/countries.csv","r") #file2
        for line2 in cf:
            name= regex.sub("",   " ".join( ( line2.split(",")[-1] ).split() ) )
        #print(c,name,c==name)
            if (name in c):
                print("Almost",c,name)
                found=True
                countries.remove(c)
                break;
        cf.close()
        if(found==False):
            print("Lost: ",c)
    
 
 
    # countries=[]
    # with open('static/data/Trade-Register-2010-2018.csv', newline='') as csvfile:
    #     spamreader = csv.reader(csvfile, delimiter=',')
    #     for i,row in enumerate(spamreader):
    #         #print(i,row[0],row[1])
    #         if(row[0] not in countries):
    #             countries.append(row[0])
    #         if(row[1] not in countries):
    #             countries.append(row[1])


    # print(countries)
    # with open('static/data/countries.csv', newline='') as csvfile2:
    #     spamreader2 = csv.reader(csvfile2, delimiter=',')
    #     for c in countries[2:7]:
    #         print(c)
    #         for i,row in enumerate(spamreader2):
    #             name=row[-1]
    #             if(c==name):
    #                 print("found",c)
    #             #print(c,name)


main()
