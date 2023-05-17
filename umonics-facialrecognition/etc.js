document.getElementById('radio1').addEventListener('mouseover', () => {
    document.getElementById('radio-info-label').innerHTML = "Normal speed rendering for normal people. Boring."
});
  
document.getElementById('radio2').addEventListener('mouseover', () => {
    document.getElementById('radio-info-label').innerHTML = "Double rendering speed. Cuts rendering time in half."
});
  
document.getElementById('radio4').addEventListener('mouseover', () => {
    document.getElementById('radio-info-label').innerHTML = "The safest option to use."
});
  
document.getElementById('radio8').addEventListener('mouseover', () => {
    document.getElementById('radio-info-label').innerHTML = "For computers with better specs."
});
  
document.getElementById('radio16').addEventListener('mouseover', () => {
    document.getElementById('radio-info-label').innerHTML = "WARNING: Recommended only for high performance computers!"
});


//If you want to copyText from Element
function copyTextFromElement(elementID) {
    let element = document.getElementById(elementID); //select the element
    let elementText = element.value; //get the text content from the element
    copyText(elementText); //use the copyText function below
}
  
  //If you only want to put some Text in the Clipboard just use this function
  // and pass the string to copied as the argument.
function copyText(text) {
    navigator.clipboard.writeText(text);
}



/** 
 *  var ctable = document.getElementById("character-table");
        var newRow = document.createElement("tr");
        var newCell = document.createElement("td");
        var newButton = document.createElement("button");
        var newImage = document.createElement("img");
        var newName = document.createElement("p");
    
        newName.innerHTML = "Annie";
        newImage.src = "../students/Annie/1.png";
        newButton.id = "button-choice-annie";
        newButton.className = "button-choice";
        newButton.value = "Annie";
        newButton.addEventListener("click", function() {
            this.disabled = true;
        });
    
        newButton.appendChild(newName);
        newButton.appendChild(newImage);
        newCell.appendChild(newButton);
        newRow.appendChild(newCell);
        ctable.appendChild(newRow);
 */