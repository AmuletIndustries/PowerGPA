$("#afterH1").append("<div class='gpa'></div>")
$(".gpa").append("<p id='gpaTitle'>GPA (W/UW):</p>");
var gradesArray = [];
var headerArray = [];

$("tbody:first tr").each(function() {
    var arrayOfThisRow = [];
    var tableData = $(this).find('td');
    if (tableData.length > 0) {
        tableData.each(function() { arrayOfThisRow.push($(this).text()); });
        gradesArray.push(arrayOfThisRow);
    }
});
$("tbody:first tr").each(function() {
    var arrayOfThisRow = [];
    var tableData = $(this).find('th');
    if (tableData.length > 0) {
        tableData.each(function() { arrayOfThisRow.push($(this).text()); });
        headerArray.push(arrayOfThisRow);
    }
});

var headers = ["Q1","Q2","Q3","Q4","S1","S2"]; //To access the column values from
var colIndexArray = [12,14,16,18,15,19]; //Default 
//Course,Q1,Q2,Q3,Q4,S1,S2
var courseRow = 11; //Default
var offsetCount = 8;

var gpaArrays = [[]]; //2d array
var gpaArraysUw = [[]];
//Q1,Q2,Q3,Q4,S1,S2

var weighting=0;

for(var j = 0; j < headerArray[1].length; j++) {
  if (typeof headerArray[1][j] != 'undefined') {
    for (var h = 0; h < headers.length; h++) {
      if (headerArray[1][j].toString().replace(/\s/g) == headers[h]) {
          colIndexArray[h] = j+offsetCount; //Day count offset in table
      }
    }
    if (headerArray[1][j].toString().replace(/\s/g) == "Course") {
        courseRow = j+offsetCount;
    }
  }
}




var pattern = [
  ["A.P.", "AP", "Calculus", "Diff"],
  [" Honors", "[0-9]H"],
  ["[0-9]A", "Contemp"], //Not necessary - for programatic weight reduction
  [" B", "[0-9]B"],
  ["Algebra C", "[0-9]C"]
]


for(var i = 0; i < gradesArray.length; i++) {
  for(var j = 0; j < gradesArray[i].length; j++) {
    weighting=0;
    for (var k = 0; k<colIndexArray.length; k++) {
      if (j==colIndexArray[k]) {
        var storageIndex = k;
        var col = j;
        for (var p = 0; p<pattern.length; p++) {
          var re = new RegExp(pattern[p].join("|"), "i");
          if (re.test(gradesArray[i][courseRow])) {
            weighting = 0.666-0.333*p;
          }
        } //AP=include in weighting //
        getGrades(i,weighting,col,storageIndex);
      }
    }
  }
}

averageGPA();

console.log(gpaArrays)

function getGrades(rowIndex, weighting, colIndex, storageIndex) {
  //Q1
//olIndexArray[storageIndex]
  if (typeof gpaArrays[storageIndex] == 'undefined') {
    gpaArrays[storageIndex] = new Array();
    gpaArraysUw[storageIndex] = new Array();
  }
  //console.log(rowIndex, col);
  if (gradesArray[rowIndex][colIndex].match(/\d+/g) != null) {
    //Contains grades
    //StorageIndex = where in the GPA array to store, and which index in the columnarray to grab from
    letterGrade = gradesArray[rowIndex][colIndex].toString().replace(/[^A-Z+-]/g,'');
    gpaArrays[storageIndex].push(calculateClassGPA(letterGrade, weighting));
    gpaArraysUw[storageIndex].push(calculateClassGPA(letterGrade, 0));
  } else {
    gpaArrays[storageIndex].push(-1);
    gpaArraysUw[storageIndex].push(-1);
  }
}

function calculateClassGPA(letterGrade, weighting) {
  var g = 0.0;
  //console.log(letterGrade)
  var l = ["A", "B", "C", "D", "N"];
  for (var i=0; i<l.length; i++) {
    if (letterGrade.includes(l[i])) {
      g=4.00-i;
      if (letterGrade.includes("+")) {
        g+=0.333;
      } else if (letterGrade.includes("-")) {
        g-=0.333;
      }
      if (g>0) {
        g+=weighting;
      }
    }
  }
  //console.log(g);
  return(g);

}

function averageGPA() {
  //Q1
  for (var g=0; g<gpaArrays.length; g++) {
    var l = gpaArrays[g].length;
    var classTotal = 0;
    var GpaTotal = 0.0;
    var GpaTotalUw = 0.0;
    for (var i=0; i<l; i++) {
      if (gpaArrays[g][i] != -1) {
        GpaTotal+=gpaArrays[g][i];
        GpaTotalUw+=gpaArraysUw[g][i];
        classTotal++;
      }
    }
    var average = GpaTotal/classTotal;
    var averageUw = GpaTotalUw/classTotal;
    if (GpaTotal>0) {
      displayGPA(headerArray[1][colIndexArray[g]-8].toString(), average, averageUw);
    }
  }
}

function displayGPA(name, gpa, gpaUw) {
  gpa = gpa.toFixed(2);
  gpaUw = gpaUw.toFixed(2);
  $(".gpa").append("<span tabindex='0'>" + name + ": " + gpa + "/" + gpaUw + "</span></br>");
}
//j = col
//i= row
//j = 11 = class
//Q1 = j12
//q2 = j14
//S1= j15
//3 = 16, 4=17, s2=18, f1=19
//Honors: " honors", " #H", "AP", "A.P."
