/*
* How to use this piece of cra...cker
* 
* In your default html file link this piece of cracker at the end.
* It'll 
*   - load bootstrap from lib/bootstrap;
*   - replace contents of elements (presumably div) with id 
*       'header-template' with header,
*       'footer-template' with footer
*     if such (divs/templates) are present.
*   - maybe do some other stuff I've not yet documented...
* To add header/footer template create header.html/footer.html 
* in folder templates.
* 
* */


// load bootstrap
document.body.innerHTML += '<link rel="stylesheet" href="lib/bootstrap/dist/css/bootstrap.css">'
document.body.innerHTML += '<script src="lib/bootstrap/dist/js/bootstrap.js"></script>'

// insert header if needed
headerDiv = document.getElementById("header-template")
if (headerDiv != null) 
{
    fetch("/templates/header.html")
        .then(response => response.text())
        .then(text => headerDiv.innerHTML = text)
}

// insert footer if needed
footerDiv = document.getElementById("footer-template")
if (headerDiv != null)
{
    
    fetch("/templates/footer.html")
        .then(response => response.text())
        .then(text => footerDiv.innerHTML = text)
}

// update page title
document.title += ' — EventHive'