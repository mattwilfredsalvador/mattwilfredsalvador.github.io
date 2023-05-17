const video = document.getElementById('video')
const videoSrc = document.getElementById('video-source')
const logArea = document.getElementById('logArea')
const subtitles = document.getElementById('subtitles')
const upload = document.getElementById('uploadbutton')

const logdiv = document.getElementById('log-div')
const oneminbutton = document.getElementById('one-min-button')
const oneminarea = document.getElementById('one-min-area')
const individualarea = document.getElementById('individual-area')
const summativebutton = document.getElementById('summative-button')
const individualbutton = document.getElementById('individual-button')
const summativearea = document.getElementById('summative-area')

//change based on preference

var videoSpeed = 1.0; // up to 16x speed
const confidenceMatchValue = 0.50 //confidence level for face matching 0.5 default
var firingIntervalAPI = 500; // 37.5 for 1 minute in 16x speed
var firingIntervalReport = 15000; // 4150 for 1 minute //20750 for 5mins
var faceSensitivity = 608; // interval of 32l the lower, the stricter
var faceTreshold = 0.5; // default 0.5
var euclideanDistance = 0.6; // default 0.6
//const labels = ['Teacher MJ', 'Josias', 'Reina'] //for the folders of image
var matchedName = "";
var reportTimer = null;

var labels = [];


/**function Object(name){
  this.name = name
  this.n = 0, 
  this.h = 0, 
  this.sa = 0, 
  this.a = 0, 
  this.f = 0, 
  this.d = 0, 
  this.su = 0
}**/

var students = new Array()

students = [];

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(startVideo)

async function startVideo() {

  upload.onchange = function(event) {
    let file = event.target.files[0];
    let blobURL = URL.createObjectURL(file);
    video.style.display = 'block';
    video.src = blobURL;
    upload.style.display = "none";
    document.body.style.backgroundImage = 'none';
    document.getElementById('uploadbuttonlabel').style.display = "none";
    video.playbackRate = videoSpeed;
    video.style.padding = "40px";
    video.style.border = "solid 1px grey"
  }

  /**function changeVideo() {
    document.getElementById("uploadbutton").style.display = "none"
    //var chosenFile = document.getElementById("uploadbutton").files[0];
    var chosenFile = e.target.files[0]
    video.setAttribute("src", URL.createObjectURL(chosenFile));
  }
  
  document.getElementById("uploadbutton").addEventListener("change", changeVideo);**/

  //video.src = "../videos/alexsam.mp4"
  //video.src = "../videos/test video.mp4"
  //video.src = "../videos/Say My Name Clip - Beetlejuice The Musical.mp4"
  //video.src = "../videos/Community.mp4"
  video.playbackRate = videoSpeed

  /** Screen Capture
  video.srcObject = await navigator.mediaDevices.getDisplayMedia({ video: { mediaSource: "screen" } },
    err => console.error(err));
    **/

  /** .then((strm) => {
    strm.getVideoTracks()[0].getSettings().displaySurface;
  })
  .catch((err) => console.error(err));**/

  /**navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )**/
  
}


video.addEventListener('play', () => {
    // video.playbackRate = videoSpeed;

    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    canvas.style.pointerEvents = "none";

    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)

    setInterval(async () => {
      const labeledDescriptors = await loadLabeledImages()
      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, confidenceMatchValue)

      // inputSize = 608
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: faceSensitivity, scoreThreshold: faceTreshold })).withFaceLandmarks().withFaceExpressions().withFaceDescriptors()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    
      //const reports = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({inputSize: 608})).withFaceLandmarks().withFaceExpressions()
      
      
      experimentDetections(detections);

      //experimentDetections(detections);

      //experimentDetections(detections);

      //console.log(reports)

      //console.log(JSON.stringify(reports))

      //console.log(JSON.stringify(reports[0].expressions))
      /**if (reports.hasOwnProperty("expressions")){
        console.log(reports.expressions);
      }**/

      const results = resizedDetections.map((d) => {
        return faceMatcher.findBestMatch(d.descriptor)
      })

      results.forEach((bestMatch, i) => {
        const box = resizedDetections[i].detection.box
        var drawBox;
        //if (bestMatch.toString() !== "unknown") {
          drawBox = new faceapi.draw.DrawBox(box, {label: bestMatch.toString()})
          //drawBox = new faceapi.draw.DrawBox(box, {label: "          " + bestMatch.toString()})
          console.log("Decision: " + bestMatch.toString(false))
          console.log("Canvas: " + bestMatch.toString())
          matchedName = bestMatch.toString(false)
          drawBox.draw(canvas)
        //}
      })

      
      //faceapi.draw.drawDetections(canvas, resizedDetections)
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    }, firingIntervalAPI) //37.5 for 1 minute
})

function createCharacterChoices(){
  /** */
}

function loadLabeledImages(){

  return Promise.all(
    labels.map(async (label) => {
      const descriptions = []
      for (let i=1; i<=5; i++) {
        const reference = await faceapi.fetchImage(`../students/${label}/${i}.png`)
        const referenceFaces = await faceapi.detectSingleFace(reference).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(referenceFaces.descriptor)
      }
      console.log("Matched: " + label)
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}

function formatTime(seconds) {
  minutes = Math.floor(seconds / 60);
  minutes = (minutes >= 10) ? minutes : "0" + minutes;
  seconds = Math.floor(seconds % 60);
  seconds = (seconds >= 10) ? seconds : "0" + seconds;
  return minutes + ":" + seconds;
}

function filterData(emotion) {
  return yourJSON.filter(object => {
      return object['expressions'] == emotion;
  });
}

/** ------------------------------------- */

var z = ""
var tn = 0, th = 0, tsa = 0, ta = 0, tf = 0, td = 0, tsu = 0

//one minute mark
var an = 0, ah = 0, asa = 0, aa = 0, af = 0, ad = 0, asu = 0
var n = 0, h = 0, sa = 0, a = 0, f = 0, d = 0, su = 0

var ia = 0;

//five minute mark
var fan = 0, fah = 0, fasa = 0, faa = 0, faf = 0, fad = 0, fasu = 0
//n: 0, h: 0, sa: 0, a: 0, f: 0, d: 0, su: 0


/**for (var i = 0; i < labels.length; i++){
  var s = new Student(labels[i])
  arrayOfReports.push(s)
}**/

function experimentDetections(data) {

  var calledName = matchedName

  var x = 0;
  //const last = students.length - 1

  console.log("Recall: " + calledName) 
  //console.log("console: " + JSON.stringify(data))
  //console.log("Arr Arr: " + JSON.stringify(students))

  for (var i = 0; i < data.length; i++){
    const n = JSON.stringify(data[i].expressions.neutral)
    const h = JSON.stringify(data[i].expressions.happy)
    const sa = JSON.stringify(data[i].expressions.sad)
    const a = JSON.stringify(data[i].expressions.angry)
    const f = JSON.stringify(data[i].expressions.fearful)
    const d = JSON.stringify(data[i].expressions.disgusted)
    const su = JSON.stringify(data[i].expressions.surprised)

    x = Math.max(n,h,sa,a,f,d,su)

    for (var i = 0; i < students.length; i++){
      if (students[i].name === calledName) {
        if (x == parseFloat(n)){
          students[i].n += 1
          students[i].stn += 1
          tn++
        } else if (x == parseFloat(h)){
          students[i].h += 1
          students[i].sth += 1
          th++
        } else if (x == parseFloat(sa)){
          students[i].sa += 1
          students[i].stsa += 1
          tsa++
        } else if (x == parseFloat(a)){
          students[i].a += 1
          students[i].sta += 1
          ta++
        } else if (x == parseFloat(f)){
          students[i].f += 1
          students[i].stf += 1
          tf++
        } else if (x == parseFloat(d)){
          students[i].d += 1
          students[i].std += 1
          td++
        } else if (x == parseFloat(su)){
          students[i].su += 1
          students[i].stsu += 1
          tsu++
        }
      } 
      
      /**else {
        //console.log(JSON.stringify(students[last].name))
        if (x == parseFloat(n)){
          students[last].n += 1
          students[last].stn += 1
          tn++
        } else if (x == parseFloat(h)){
          students[last].h += 1
          students[last].sth += 1
          th++
        } else if (x == parseFloat(sa)){
          students[last].sa += 1
          students[last].stsa += 1
          tsa++
        } else if (x == parseFloat(a)){
          students[last].a += 1
          students[last].sta += 1
          ta++
        } else if (x == parseFloat(f)){
          students[last].f += 1
          students[last].stf += 1
          tf++
        } else if (x == parseFloat(d)){
          students[last].d += 1
          students[last].std += 1
          td++
        } else if (x == parseFloat(su)){
          students[last].su += 1
          students[last].stsu += 1
          tsu++
        }
      }**/
    }
  }
}

reportTimer = setInterval(function() {

  const current = Math.floor(video.currentTime)
  const minute = Math.round(current / 60)

  var tempData = "";

  for (var i = 0; i < students.length; i++){
    //if (students[i].name === calledName) {
      var arr = [students[i].n, students[i].h, students[i].sa, students[i].a, students[i].f, students[i].d, students[i].su]
      var dominant = Math.max(...arr)
      index = arr.indexOf(dominant)
      arr.splice(index, 1)
      var secondDominant = Math.max(...arr)

      if (secondDominant == parseFloat(students[i].n)){
        secondDominantLabel = "Neutral"
      } else if (secondDominant == parseFloat(students[i].h)){
        secondDominantLabel = "Happiness"
      } else if (secondDominant == parseFloat(students[i].sa)){
        secondDominantLabel = "Sadness"
      } else if (secondDominant == parseFloat(students[i].a)){
        secondDominantLabel = "Angry"
      } else if (secondDominant == parseFloat(students[i].f)){
        secondDominantLabel = "Fearful"
      } else if (secondDominant == parseFloat(students[i].d)){
        secondDominantLabel = "Disgusted"
      } else if (secondDominant == parseFloat(students[i].su)){
        secondDominantLabel = "Surprised"
      }

      const resultArr = [dominant, secondDominant, secondDominantLabel]

      if (dominant == secondDominant){
        z = 
        students[i].name +
        "\nα: " + resultArr[2] + " " + secondDominant + "\n"
      } else if (dominant == parseFloat(students[i].n)){
        z = 
        students[i].name +
        "\nα: Neutral " + dominant
        + "\nβ: " + resultArr[2] + " " + secondDominant + "\n"
      } else if (dominant == parseFloat(students[i].h)){
        z = 
        students[i].name +
        "\nα: Happiness " + dominant
        + "\nβ: " + resultArr[2] + " " + secondDominant + "\n"
      } else if (dominant == parseFloat(students[i].sa)){
        z = 
        students[i].name +
        "\nα: Sadness " + dominant
        + "\nβ: " + resultArr[2] + " " + secondDominant + "\n"
      } else if (dominant == parseFloat(students[i].a)){
        z = 
        students[i].name +
        "\nα: Anger " + dominant
        + "\nβ: " + resultArr[2] + " " + secondDominant + "\n"
      } else if (dominant == parseFloat(students[i].f)){
        z = 
        students[i].name +
        "\nα: Fearful " + dominant
        + "\nβ: " + resultArr[2] + " " + secondDominant + "\n"
      } else if (dominant == parseFloat(students[i].d)){
        z = 
        students[i].name +
        "\nα: Disgusted " + dominant
        + "\nβ: " + resultArr[2] + " " + secondDominant + "\n"
      } else if (dominant == parseFloat(students[i].su)){
        z = 
        students[i].name +
        "\nα: Surprised " + dominant
        + "\nβ: " + resultArr[2] + " " +  secondDominant + "\n"
      }

      tempData += z

    //refresh
    students[i].n = 0, students[i].h = 0, students[i].sa = 0, students[i].a = 0, students[i].f = 0, students[i].d = 0, students[i].su = 0

    //}
  }
  console.log( "\n\nTimestamp: " + minute + "min\n" + tempData)
  logArea.value +=  "\n\nTimestamp: " + minute + "min\n" + tempData

}, firingIntervalReport)


summativebutton.addEventListener('click', function(){
  var d = new Date();

  var downloadableLink = document.createElement('a');
  downloadableLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(summativearea.value));

  const fileName = d.toLocaleString();

  downloadableLink.download = "SUMMATIVE_REPORT("+ fileName + ").txt";
  document.body.appendChild(downloadableLink);
  downloadableLink.click();
  document.body.removeChild(downloadableLink);
});

oneminbutton.addEventListener('click', function(){
  var d = new Date();

  var downloadableLink = document.createElement('a');
  downloadableLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(oneminarea.value));

  const fileName = d.toLocaleString();

  downloadableLink.download = "INTERVAL_REPORT("+ fileName + ").txt";
  document.body.appendChild(downloadableLink);
  downloadableLink.click();
  document.body.removeChild(downloadableLink);
})

individualbutton.addEventListener('click', function(){
  var d = new Date();

  var downloadableLink = document.createElement('a');
  downloadableLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(individualarea.value));

  const fileName = d.toLocaleString();

  downloadableLink.download = "INDIVIDUAL_REPORT("+ fileName + ").txt";
  document.body.appendChild(downloadableLink);
  downloadableLink.click();
  document.body.removeChild(downloadableLink);
})


video.addEventListener('ended', () => {

  clearInterval(reportTimer);
  video.currentTime = 0;
  video.controls = true;
  video.playbackRate = 1.0;
  firingIntervalAPI = 1000; //37.5 for 1 minute in 16x speed
  firingIntervalReport = 100000;
  logdiv.style.display = "block";
  document.getElementById('title-2').style.display = "block";
  
     // ---------- 1 second ---------- //


  const total = tn + th + tsa + ta + tf + td + tsu;

  var finalReport = 
    "SUMMATIVE REPORT" +
    "\n\nDuration: " + (video.duration).toFixed(2) + "s" +
    "\nTotal Frequencies: " + total + "\n" +
    "\nNEU Frequency: " + tn + " (" + (tn/total*100).toFixed(2) + "%)" +
    "\nHAP Frequency: " + th + " (" + (th/total*100).toFixed(2) + "%)" +
    "\nSAD Frequency: " + tsa + " (" + (tsa/total*100).toFixed(2) + "%)" +
    "\nANG Frequency: " + ta + " (" + (ta/total*100).toFixed(2) + "%)" +
    "\nFEA Frequency: " + tf + " (" + (tf/total*100).toFixed(2) + "%)" +
    "\nDIS Frequency: " + td + " (" + (td/total*100).toFixed(2) + "%)" +
    "\nSUR Frequency: " + tsu + " (" + (tsu/total*100).toFixed(2) + "%)"

  var individualTotalReport = ""

  for (var i = 0; i < students.length; i++){
    var indivArr = [students[i].stn, students[i].sth, students[i].stsa, students[i].sta, students[i].stf, students[i].std, students[i].stsu]
    
    stz = students[i].name +  
    "\nNEU Frequency: " + indivArr[0] + " (" + (indivArr[0]/total*100).toFixed(2) + "%)" +
    "\nHAP Frequency: " + indivArr[1] + " (" + (indivArr[1]/total*100).toFixed(2) + "%)" +
    "\nSAD Frequency: " + indivArr[2] + " (" + (indivArr[2]/total*100).toFixed(2) + "%)" +
    "\nANG Frequency: " + indivArr[3] + " (" + (indivArr[3]/total*100).toFixed(2) + "%)" +
    "\nFEA Frequency: " + indivArr[4] + " (" + (indivArr[4]/total*100).toFixed(2) + "%)" +
    "\nDIS Frequency: " + indivArr[5] + " (" + (indivArr[5]/total*100).toFixed(2) + "%)" +
    "\nSUR Frequency: " + indivArr[6] + " (" + (indivArr[6]/total*100).toFixed(2) + "%)\n"

    individualTotalReport += stz
  }
  
  /** --------------------- */
  oneminarea.value = "1 MINUTE INTERVAL REPORT\n\n" + logArea.value
  summativearea.value = finalReport
  individualarea.value = "SUMMATIVE INDIVIDUAL REPORT \n\n" + individualTotalReport
  
  
  /** 
  var tempText = logArea.value
  logArea.value = "1 MINUTE INTERVAL REPORT\n" + tempText

  var downloadableLink = document.createElement('a');
  downloadableLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(logArea.value));

  const fileName = d.toLocaleString();

  downloadableLink.download = "INTERVAL_REPORT("+ fileName + ").txt";
  document.body.appendChild(downloadableLink);
  downloadableLink.click();
  document.body.removeChild(downloadableLink);

  logArea.value = finalReport + individualTotalReport

  var downloadableLink = document.createElement('a');
  downloadableLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(logArea.value));

  downloadableLink.download = "SUMMATIVE_REPORT(" + fileName + ").txt";
  document.body.appendChild(downloadableLink);
  downloadableLink.click();
  document.body.removeChild(downloadableLink);

  **/

  /**var doc = new jsPDF()

  doc.text(logArea2.value, 10, 10)
  doc.save(fileName + '.pdf')**/
});


/** <tr><td><button class="button-choice" id="button-choice-sam" value="Sam" onclick="this.disabled=true;"><img src="../students/Sam/1.png"><p>Sam</p></button></td></tr> */


/**function addNewCharacter(){
  var ctable = document.getElementById("character-table");
  var newRow = document.createElement("tr");
  var newCell = document.createElement("td");
  var newButton = document.createElement("button");
  var newImage = document.createElement("img");
  var newName = document.createElement("p");

  newName.innerHTML = "Annie";
  newImage.src = "../students/Annie/1.png";
  newButton.id = "button-choice-annie";
  newButton.class = "button-choice";
  newButton.value = "Annie";
  newButton.onclick = "this.disabled=true"

  newButton.appendChild(newName);
  newButton.appendChild(newImage);
  newCell.appendChild(newButton);
  newRow.appendChild(newCell);
  ctable.appendChild(newRow);
}**/


/** ------ RADIO BUTTON CHANGE ------ **/

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

document.getElementById('radio1').addEventListener('change', () => {
  video.playbackRate = 1.0;
  firingIntervalAPI = 1000; 
  firingIntervalReport = 60000;
  faceSensitivity = 608;
  faceTreshold = 0.5;
});

document.getElementById('radio2').addEventListener('change', () => {
  video.playbackRate = 2.0;
  firingIntervalAPI = 100; //500
  firingIntervalReport = 30000;
  faceSensitivity = 640;
  faceTreshold = 0.55;
});
document.getElementById('radio4').addEventListener('change', () => {
  video.playbackRate = 4.0;
  firingIntervalAPI = 100; //100
  firingIntervalReport = 15000;
  faceSensitivity = 640;
  faceTreshold = 0.5;
});
document.getElementById('radio8').addEventListener('change', () => {
  video.playbackRate = 8.0;
  firingIntervalAPI = 100;
  firingIntervalReport = 7500;
  faceSensitivity = 640;
  faceTreshold = 0.65;
});
document.getElementById('radio16').addEventListener('change', () => {
  video.playbackRate = 16.0;
  firingIntervalAPI = 100;
  firingIntervalReport = 4150;
  faceSensitivity = 704;
  faceTreshold = 0.7;
});

/**
 * students = [
  {
    name: 'Teacher MJ', 
    n: 0, h: 0, sa: 0, a: 0, f: 0, d: 0, su: 0,
    stn: 0, sth: 0, stsa: 0, sta: 0, stf: 0, std: 0, stsu: 0,
   },
  {
    name: 'Josias', 
    n: 0, h: 0, sa: 0, a: 0, f: 0, d: 0, su: 0,
    stn: 0, sth: 0, stsa: 0, sta: 0, stf: 0, std: 0, stsu: 0,
  },
  {
    name: 'Reina', 
    n: 0, h: 0, sa: 0, a: 0, f: 0, d: 0, su: 0,
    stn: 0, sth: 0, stsa: 0, sta: 0, stf: 0, std: 0, stsu: 0,
  },
  {
    name: 'Unknown', 
    n: 0, h: 0, sa: 0, a: 0, f: 0, d: 0, su: 0,
    stn: 0, sth: 0, stsa: 0, sta: 0, stf: 0, std: 0, stsu: 0,
  }
]; */

/** var folderArr = ["Annie", "Sam"];

function addNewCharacter(){
  for (var i = 0; i < folderArr.length; i++){
    var ctable = document.getElementById("character-table");
    var newRow = document.createElement("tr");
    var newCell = document.createElement("td");
    var newButton = document.createElement("button");
    var newImage = document.createElement("img");
    var newName = document.createElement("p");
    
    newName.innerHTML = folderArr[i];
    newImage.src = `../students/${folderArr[i]}/1.png`;
    newButton.id = `button-choice-${folderArr[i]}`;
    newButton.className = "button-choice";
    newButton.value = folderArr[i];
    newButton.addEventListener("click", function() {
      this.disabled = true;
    });
    
    newButton.appendChild(newName);
    newButton.appendChild(newImage);
    newCell.appendChild(newButton);
    newRow.appendChild(newCell);
    ctable.appendChild(newRow);

    document.getElementById(`button-choice-${folderArr[i]}`).addEventListener("click", function(){
      labels.push(folderArr[i])
      //console.log(labels)
      console.log(`Successfully created new Object (${folderArr[i]})`)
    
      var stud = { name: `${folderArr[i]}`, 
        n: 0, h: 0, sa: 0, a: 0, f: 0, d: 0, su: 0,
        stn: 0, sth: 0, stsa: 0, sta: 0, stf: 0, std: 0, stsu: 0, }
    
      students.push(stud)
      console.log(students)
    });

  }
}**/