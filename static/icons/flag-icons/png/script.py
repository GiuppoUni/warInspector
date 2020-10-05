lw=[] 
l1=[]
l2=[]
with open("states.txt","r") as ff: 
    for r in ff: 
        l1.append(r) 

with open("states2.txt","r") as ff: 
    for r in ff: 
        l2.append(r) 

with open("states3.txt","w") as ff: 
    
    for r1 in l1: 
        found=False
        for r2 in l2:
            name11=r1.strip()
            name1=r1.strip().lower()
            flag = r2.split(",")[0]
            name2 = r2.split(",")[1].strip().lower()
            if(name1==name2):
                ff.write("<option>"+flag + " " + name11+"</option>")
                found=True
            
        if(not found):
            # ff.write("<option>"+name11+"</option>")
            print("<option> "+name11+"</option>")
