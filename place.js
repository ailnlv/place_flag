var bandera = [
    "3333333333333333333333333333333333333333333",
    "3ddddddddddddd00000000000000000000000000003",
    "3ddddddcdddddd00000000000000000000000000003",
    "3dddddd0dddddd00000000000000000000000000003",
    "3dddddc0cddddd00000000000000000000000000003",
    "3dddddb0bddddd00000000000000000000000000003",
    "3dbbbb000bbbbd00000000000000000000000000003",
    "3ddb0000000bdd00000000000000000000000000003",
    "3dddc00000cddd00000000000000000000000000003",
    "3dddd00000dddd00000000000000000000000000003",
    "3dddc00b00cddd00000000000000000000000000003",
    "3dddbbcdcbbddd00000000000000000000000000003",
    "3dddcdddddcddd00000000000000000000000000003",
    "3ddddddddddddd00000000000000000000000000003",
    "3555555555555555555555555555555555555555553",
    "3555555555555555555555555555555555555555553",
    "3555555555555555555555555555555555555555553",
    "3555555555555555555555555555555555555555553",
    "3555555555555555555555555555555555555555553",
    "3555555555555555555555555555555555555555553",
    "3555555555555555555555555555555555555555553",
    "3555555555555555555555555555555555555555553",
    "3555555555555555555555555555555555555555553",
    "3555555555555555555555555555555555555555553",
    "3555555555555555555555555555555555555555553",
    "3333333333333333333333333333333333333333333", 
]

var posx = 626
  , posy = 642
  , ancho = bandera[0].length
  , alto = bandera.length;

var colores = $('div.place-swatch').map(function(i, x) {
    rgbString = x.style.getPropertyValue('background-color');
    bytes = rgbString.slice(4, -1).split(", ").map(Number);
    bytes.push(255);
    return {
        number: i.toString(16),
        rgba: bytes
    };
});

colores = $.makeArray(colores);

bandera = bandera.join("");

function getMalos() {
    var ctx = document.getElementById('place-canvasse').getContext('2d');

    var raw = ctx.getImageData(posx, posy, ancho, alto).data;
    var pixeles = [];
    for (i = 0; i < raw.length; i += 4) {
        p = Array.prototype.slice.call(raw.slice(i, i + 4));
        colores.some(function(color) {
            if (_.isEqual(color.rgba, p)) {
                pixeles.push(color.number);
            }
        });
    }

    malos = [];
    for (i = 0; i < bandera.length; i++) {
        if (bandera[i] != pixeles[i]) {
            x = i % ancho + posx;
            y = Math.floor(i / ancho) + posy;
            malos.push({
                x: x,
                y: y,
                color: parseInt(bandera[i], 16),
                wrongcolor: pixeles[i]
            });
        }
    }
    console.log(malos.length + " pixeles malos");
    return malos;
}

function fixPixel() {
    malos = getMalos();
    if (malos) {

        p = malos[0];
        console.log("Arreglando", p);
        $.ajax({
            url: "/api/place/draw.json",
            type: "POST",
            headers: {
                'X-Modhash': r.config.modhash
            },
            data: {
                x: p.x,
                y: p.y,
                color: p.color
            },
        }).done(function(response) {
            console.log('Pixel arreglado');
        }).fail(function(response) {
            console.log('Me apure mucho');
        }).always(function(response) {
            tiempo = response.responseJSON ? response.responseJSON.wait_seconds : response.wait_seconds;
            console.log("Esperando", tiempo, "segundos");
            setTimeout(fixPixel, tiempo * 1000);
        });
    } else {
        // esperar
        console.log('Nada que arreglar, esperando dos minutos');
        setTimeout(fixPixel, 120 * 1000);
    }
}
fixPixel();
