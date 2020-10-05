with open("countriesAlpha3.csv","r") as f:
    dc={}
    i=0
    for line in f:
        if(i==0): 
            i+=1
            continue
        cols = line.split(",")
        dc[cols[3].strip()] = cols[4].strip()
print(dc)