let bg
let logo1
let logo2
let jumlahPenduduk;
class Orang{

  constructor(x,y,r,p){
    this.r = r;
    this.pos = createVector(x,y);
    this.vel = createVector((random(-1,1)),(random(-1,1)));
    this.vel.mult(4);
    this.status = 1;
    this.waktusakit=0;
    
    
    /*
      menentukan peluang sebuah objek WFH atau tetap beraktifitas
      true jika tetap beraktifias, false berarti WFH
      jika WFH makan tidak bisa tertular
      semakin kecil ambang batas, maka semakin banyak yang WFH
      
    */
    this.move=true;
    
    
    this.peluangbepergian=p;
    if(random()>this.peluangbepergian){
      this.move=false;
    }
  }
  tumbukan(lain){   
    var jarak = dist(this.pos.x, this.pos.y, lain.pos.x, lain.pos.y);
    
    return(jarak <= (this.r+lain.r));

  }

  tumbukan(lain){
    var jarak = dist(this.pos.x, this.pos.y, lain.pos.x, lain.pos.y)
    
    if(jarak <= this.r+ lain.r){
       return true;
    }else{
      return false;
    }
  }
  gantaiarah(lain){

       var tmp = lain.vel;
      lain.vel = this.vel;
      this.vel = tmp; 

   
  }
  penularan(lain,timestamp){
    if(this.status==2 && lain.status==1){
       lain.status=2;
        lain.waktusakit = timestamp;
    }
    
    if(lain.status==2 && this.status==1){
       this.status=2;
        this.waktusakit = timestamp;
    }
  }
  ceksembuh(waktunyata,masapenyembuhan){
    if (waktunyata >= this.waktusakit+masapenyembuhan){
        this.status=3;
    }
  }
  update(){
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    
    if(this.pos.y+this.vel.y-this.r <= 350 || this.pos.y+this.vel.y+this.r >= (625-100)){
       this.vel.y = this.vel.y*-1
    }
    
    if(this.pos.x+this.vel.x-this.r <= 50 || this.pos.x+this.vel.x+this.r >= 550){
       this.vel.x = this.vel.x*-1
    }
  }
  show(){
    noStroke();
    ellipseMode(RADIUS);
    var col;
    
    switch(this.status){
      case 1: col = color(0,200,0); break;
      case 2: col = color(200,0,0); break;
      case 3: col = color(0,0,200); break;
    }
    fill(col);
    ellipse(this.pos.x, this.pos.y, this.r, this.r); 
  }
}  

//jumlah objek
var jum=500;

//peluang sebuah objek itu bepergian 0 sd 1
// nilai 1 berarti pasti bepergian, nilai 0 berarti diam
var peluangbepergian = 1;

//sebarapa lama kemampuan sistem kesehatan menyembuhkan pasien
//bisa dianalogikan seberapa bagus fasilitas kesehatan, semakin besar berarti semakin buruk faskes
var masapenyembuhan=150;

//batas kemampuan penanganan kesehatan 0 sd 100
var faskes = 80;

var h= []

//besar dari objek
var radius = 5;

var waktunyata=0;

// kalkulasi populasi
// sh =  sehat, sk = sakit, sm = sembuh
var kalkulasi={sh:0, sk:0, sm:0, mt:0};

//pertumbuhan angka sakit perwaktu
var psakit=[];

var info;



function preload(){
  bg=loadImage("bg.jpg")
  logo1=loadImage("logoitera.png")
  logo2=loadImage("logomath.png")
 
}
function setup() {
  createCanvas(1250, 750);
  for(var i=0; i<jum;i++){
    var x = random(50+radius,600-radius);
    var y = random(350+radius,625-radius-100);
    h.push(new Orang(x,y,radius,peluangbepergian));
    s=createInput("500")
    s.position(400,575)
  }
  h[0].status=2;
  h[0].move=true;
  info = createElement("h3"); 
  info.style('color', 'white');
}

kalkulasi.mt = 0;
function draw() {
  //background
  background("#7E1717")
  image(bg,0,0,1250,300)
  fill(74,0,0,50)
  rect(0,0,1250,750)
  fill("white")
  rect(30,320,600,225)
 // rect(50,630,270,110)

  //simulasi
  textSize(10)
  fill("white")
  text("Jumlah Penduduk",400,570)
 
  kalkulasi.sh = 0;
  kalkulasi.sk = 0;
  kalkulasi.sm = 0;
  
  for(var i=0; i<jum;i++){
     for(var j=i; j<jum;j++){
       var tumbukan = h[i].tumbukan(h[j]);
       if(j!=i & tumbukan){
          h[i].gantaiarah(h[j]);
         
           if((h[i].status==2 || h[j].status==2) & !(h[i].status==2 && h[j].status==2)){
              h[i].penularan(h[j],waktunyata);
          }
        }
     }
     switch(h[i].status){
      case 1: kalkulasi.sh++; break;
      case 2: kalkulasi.sk++; break;
      case 3: kalkulasi.sm++; break;
    }

    if(h[i].status==2){
        h[i].ceksembuh(waktunyata,masapenyembuhan);
    }
    if(h[i].move){
      h[i].update();
    }
    h[i].show();
  }
  
  if(kalkulasi.sk>faskes){
       kalkulasi.mt=kalkulasi.sk-faskes;
     }
  
  //menampilkan info angka
  var kal = kalkulasi.sm-kalkulasi.mt <0?0:kalkulasi.sm;
  info.html(`Susceptible: ${kalkulasi.sh} <br> Infected: ${kalkulasi.sk} <br> Recovered: ${kal}`);
  info.position(30,545)
  
   if(kalkulasi.sk>0){
    psakit.push([kalkulasi.sh,kalkulasi.sk,kalkulasi.sm]);
   }
  fill("white")
  rect(30,height-100,width/2-30,100)
  //menggambar grafik pertumbukan data di bagian bawah
  stroke(0);
  line(30,height-100, width/2,height-100);
  
  //garis batas kemampuan fasilitas kesehatan
  stroke(125);
  line(30,height-faskes, width/2,height-faskes);
  
  for(var c =0; c<psakit.length; c++){
    
    
        var m0 = map(psakit[c][0], 0, jum, 0, 100);
        stroke(0,200,0,125);
        line(c+30, height-100, c+30,height-100+m0); 
    
    
        var m1 = map(psakit[c][1], 0, jum, 0, 100);
        stroke(200,0,0,125);
        line(c+30,height, c+30, height-m1); 
    
      
        var m2 = map(psakit[c][2], 0, jum, 0, 100);
        stroke(0,0,200,125);
        line(c+30, height-100, c+30,height-100+m2); 
    }

    
    
    //frame dihentikan saat sudah tidak ada yang sakit
    if(kalkulasi.sk==0){
      //noLoop();
 
      redraw();
    }
    
    waktunyata++;
  
  //logo 
  image(logo1,1110,10,50,50)
  image(logo2,1165,7,58,58)
  
  //judul
  textSize(30)
  textStyle(BOLD)
  fill("white")
  text("PENULARAN VIRUS COVID19",400,120)
  
  textSize(20)
  text("Tugas Besar Mata Kuliah Visualisasi Dalam Sains Kelompok 3",320,140)
  textSize(30)
  text("Apa si Covid 19 itu??",750,350)
  textSize(15)
  text("Coronavirus Disease-2019(C0VID-19) merupakan suatu virus yang dapat",670,370)
  text("menyebabkan penyakit menular dengan gejala batuk,demam,dan hilangnya",650,385)
  text("indra perasa maupun penciuman,hingga sesak napas.",650,400)
  text("Negara kepulauan seperti Indonesia memiliki awal wabah yang berbeda, ",650,415)
  text("Sehingga,penanganan wabah yang terjadi berbeda beda.akibatnya,hasil data",650,430)
  text("kasus yang terkonfirmasi COVID-19 bervariasidan sulit di prediksi.",650,445)
  text("Pada Simulasi disamping kami menggunakan model SIR untuk Menganalisis ",670,480)
  text("dinamika dan perilaku evolusi penyakit.Model SIR terdiri atas 3 kelas populasi:",650,495)
  text("1.S = Individu Rentan",650,510)
  text("2. I = Individu Terinfeksi",650,525)
  text("3.R = Individu Sembuh",650,540)
  
  textSize(15)
  text("Tugas ini disusun Oleh kelompok 3",3*width/4,645)
  //namakelompok
  textSize(10)
  text("1.Aziza Yossefa",3*width/4,664)
  text("2.Ivan Daniel Siringo",3*width/4,675)
  text("3.Julia Fitriani",3*width/4,686)
  text("4.Nimas Prakesti Mika Aziz",3*width/4,697)
  text("5.Khairunisa",3*width/4,708)
  text("6.Cindy Salvia Situmorang",3*width/4,719)
  text("7.Adrian Aiken",3*width/4,730)
  //nim
  text("119160016",3*width/4 + 150,664)
  text("121160053",3*width/4 +150,675)
  text("121160064",3*width/4 +150,686)
  text("121160069",3*width/4 +150,697)
  text("121160081",3*width/4 +150,708)
  text("121160089",3*width/4 +150,719)
  text("121160109",3*width/4 +150,730)
}