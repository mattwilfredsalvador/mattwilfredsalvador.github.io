document.getElementById("button-choice-sam").addEventListener("click", function(){
    labels.push("Sam")
    //console.log(labels)
    console.log("Successfully created new Object (Sam)")
  
    var stud = { name: 'Sam', 
        n: 0, h: 0, sa: 0, a: 0, f: 0, d: 0, su: 0,
        stn: 0, sth: 0, stsa: 0, sta: 0, stf: 0, std: 0, stsu: 0, }
  
    students.push(stud)
    console.log(students)
})

document.getElementById("button-choice-mj").addEventListener("click", function(){
    labels.push("Teacher MJ")
    //console.log(labels)
    console.log("Successfully created new Object (Teacher MJ)")
  
    var stud = { name: 'Teacher MJ', 
        n: 0, h: 0, sa: 0, a: 0, f: 0, d: 0, su: 0,
        stn: 0, sth: 0, stsa: 0, sta: 0, stf: 0, std: 0, stsu: 0, }
  
    students.push(stud)
    console.log(students)
  })
  
  document.getElementById("button-choice-josias").addEventListener("click", function(){
    labels.push("Josias")
    //console.log(labels)
    console.log("Successfully created new Object (Josias))")
  
    var stud = { name: 'Josias', 
        n: 0, h: 0, sa: 0, a: 0, f: 0, d: 0, su: 0,
        stn: 0, sth: 0, stsa: 0, sta: 0, stf: 0, std: 0, stsu: 0, }
    
    students.push(stud)
    console.log(students)
  })
  
  document.getElementById("button-choice-reina").addEventListener("click", function(){
    labels.push("Reina")
    //console.log(labels)
    console.log("Successfully created new Object (Reina)")
  
    var stud = { name: 'Reina', 
        n: 0, h: 0, sa: 0, a: 0, f: 0, d: 0, su: 0,
        stn: 0, sth: 0, stsa: 0, sta: 0, stf: 0, std: 0, stsu: 0, }
  
    students.push(stud)
    console.log(students)
  })
  
  document.getElementById("button-choice-alex").addEventListener("click", function(){
    labels.push("Alex")
    //console.log(labels)
    console.log("Successfully created new Object (Alex)")
  
    var stud = { name: 'Alex', 
        n: 0, h: 0, sa: 0, a: 0, f: 0, d: 0, su: 0,
        stn: 0, sth: 0, stsa: 0, sta: 0, stf: 0, std: 0, stsu: 0, }
  
    students.push(stud)
    console.log(students)
  })

  document.getElementById("next-button").addEventListener("click", function(){
    var name = document.getElementById("code-name-tb").value;
    var generatedCode = 
    `document.getElementById("button-choice-`+ name + `").addEventListener("click", function(){
        labels.push("` + name + `")

        console.log("Successfully created new Object (`+ name + `)")
      
        var stud = { name: '`+ name + `', 
            n: 0, h: 0, sa: 0, a: 0, f: 0, d: 0, su: 0,
            stn: 0, sth: 0, stsa: 0, sta: 0, stf: 0, std: 0, stsu: 0, }
      
        students.push(stud)
        console.log(students)
      })`;
    
    document.getElementById("copyCode").value = generatedCode;
  })


  

  