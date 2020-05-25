import re
newL=""
with open("pop.csv","r") as f:
    
    for l in f:
        newL=re.sub('\[(.*?)\]', '', l)
        break

with open("pop2.csv","w") as f:
    f.write(newL)
    with open("pop.csv","r") as fr:
        i=0
        for line in fr:
            if(i!=0):
                f.write(line)
            i+=1
    f.close()
    

