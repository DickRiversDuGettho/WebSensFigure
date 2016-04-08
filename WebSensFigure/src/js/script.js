/**
 * Created by Tewfik on 09/04/2016.
 */
document.addEventListener("DOMContentLoaded", function(event) {
    //do work
    var groupTableau;
    var tableau = new Array();
    var tableauNewForm = new Array();
    var canvas = new fabric.Canvas('canvas');
    var taille = 40;
    var serializer = new XMLSerializer();
    var i;
    var path0;
    var nbElmntsSVG = document.body.getElementsByTagName('svg').length;
    var position = 0;
    var objetselectionne;

//construction des formes initiales au chargement de la page.
    for (i = 0; i < nbElmntsSVG; i = i + 1)
    {
        var svgEl0 = document.body.getElementsByTagName('svg')[i];


        var svgStr0 = serializer.serializeToString(svgEl0);
        path0 = fabric.loadSVGFromString(svgStr0, function (objects, options) {
            var obj = fabric.util.groupSVGElements(objects, options);
            obj.hasBorders = false;
            obj.scaleToHeight(taille);
            obj.scaleToWidth(taille);

            //obj.set('angle', 45);
            //obj.animate('angle', '-=5', { onChange: canvas.renderAll.bind(canvas) });

            obj.animate('left', position, {
                onChange: canvas.renderAll.bind(canvas),
                duration: 5000,
                easing: fabric.util.ease.easeOutElastic
            });

            //obj.set('selectable', false); // make object unselectable

            //.set({ left: canvas.width/2, top: canvas.height/2 })
            obj.set({left: i * taille, top: 0})
                .setCoords();

            obj.hasBorders = false;
            obj.hasControls = false;
            tableau[i] = obj;
            canvas.add(tableau[i]).renderAll();
            position = position + taille;
        });

    }

///////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////



//fond d'écran du canvas
    canvas.setBackgroundImage('img/background.jpg', canvas.renderAll.bind(canvas), {
        backgroundImageOpacity: 0.5,
        backgroundImageStretch: false,
        height: 600,
        width: 900
    });




    var indice = 0;









// greffer sur `canvas.findTarget`, pour declencher "object:over" et "object:out" events
    canvas.findTarget = (function (originalFn) {
        return function () {
            var target = originalFn.apply(this, arguments);
            if (target) {
                if (this._hoveredTarget !== target) {
                    canvas.fire('object:over', {target: target});
                    if (this._hoveredTarget) {
                        canvas.fire('object:out', {target: this._hoveredTarget});
                    }
                    this._hoveredTarget = target;
                }
            } else if (this._hoveredTarget) {
                canvas.fire('object:out', {target: this._hoveredTarget});
                this._hoveredTarget = null;
            }
            return target;
        };
    })(canvas.findTarget);

// maintenant on peut observer "object:over" and "object:out" events
//ici, la couleur de l'objet devient rouge quand on est dessus and rien sinon.

    canvas.on('object:over', function (e) {
        e.target.setStroke('red');
        canvas.renderAll();
    });

    canvas.on('object:out', function (e) {
        e.target.setStroke('black');
        canvas.renderAll();
    });

//evenement quand on selectionne une forme.
    canvas.on({'object:moving': function (e) {
        var cible = e.target;
        cible.hasControls = true;
        var xyt = canvas.getActiveGroup();

        if (($.inArray(cible, tableauNewForm)) == -1 && xyt == null)
        { //l'objet n'est pas dans le tableau des nouvellesFormes
            // on le remet dans la liste du haut

            var ind = tableau.indexOf(cible);
            var svgpp = document.body.getElementsByTagName('svg')[ind];

            var svg1 = serializer.serializeToString(svgpp);
            var path1 = fabric.loadSVGFromString(svg1, function (objects, e) {

                var obj = fabric.util.groupSVGElements(objects, e);

                obj.scaleToHeight(taille);
                obj.scaleToWidth(taille);
                obj.hasBorders = false;
                obj.hasControls = false;
                //obj.set('angle', 45);
                //obj.animate('angle', '-=5', { onChange: canvas.renderAll.bind(canvas) });

                obj.animate('left', cible.getLeft(), {
                    onChange: canvas.renderAll.bind(canvas),
                    duration: 5000,
                    easing: fabric.util.ease.easeOutElastic
                })

                //obj.set('selectable', false); // make object unselectable

                //.set({ left: canvas.width/2, top: canvas.height/2 })
                obj.set({left: ind * taille, top: 0})
                    .setCoords();
                objetselectionne = obj
                tableau[ind] = obj;

                canvas.add(tableau[ind]).renderAll();
                //canvas.getObjects().add(obj);
            });


            tableauNewForm[indice] = cible;
            indice++;



            //document.getElementById('ulReception').append('<li>'+cible+'</li>');

                //$('ul#ulReception').append('<li><input type="button" onClick=setCurrentObject('+indice+') value="Objet '+indice+'" /></li>');
                var _1 = '<li id="ligne';
                var _2 = '">	<p><input type="button" onClick=setCurrentObject(';
                var _3 = ') value="forme à la position ';
                var _4 =  '" />   <input type="button" onClick=deleteObjectAndButton(';
                var _5 = ') value="suppr." />             </p></li>';
                $('ul#ulReception').append(_1 + indice + _2 + indice + _3 + (ind + 1) + _4 + indice + _5);


        } else
        {
            var ind = tableauNewForm.indexOf(cible);
            objetselectionne = cible;

        }
    }

    });
    canvas.on({
        'object:moving': onChange,
        'object:scaling': onChange,
        'object:rotating': onChange,
    });

//evenement sur les slider de gestion d'une forme.

//l'angle
    var angleControl = document.getElementById('angleControl');
    angleControl.onchange = function (e) {
        objetselectionne.setAngle(parseInt(this.value, 10)).setCoords();
        canvas.renderAll();
    };


//slider haut-bas
    var topControl = document.getElementById('topControl');
    topControl.onchange = function (e) {
        objetselectionne.setTop(parseInt(this.value, 10)).setCoords();
        canvas.renderAll();
    };
//slider gauche-droite
    var leftControl = document.getElementById('leftControl');
    leftControl.onchange = function (e) {
        objetselectionne.setLeft(parseInt(this.value, 10)).setCoords();
        canvas.renderAll();
    };
//slider form
    var formControl = document.getElementById('formControl');
    formControl.onchange = function (e) {

        canvas.renderAll();
    };
//evenement sur le canvas qui met à jour les slider.
    canvas.on('object:selected', function (e) {
            objetselectionne = e.target;
            updateControls(e);


        }
    );


    canvas.on('mouse:move', function (options) {

        var p = canvas.getPointer(options.e);

        canvas.forEachObject(function (obj) {
            var distX = Math.abs(p.x - obj.left),
                distY = Math.abs(p.y - obj.top),
                dist = Math.round(Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2)));

            obj.setOpacity(1 / (dist / 200));
        });

        canvas.renderAll();
    });





    canvas.on({
        'object:moving': updateControls,
        'object:resizing': updateControls,
        'object:rotating': updateControls
    });

    function setCurrentObject(e) {

        objetselectionne = tableauNewForm[e - 1];
        updateCtrls(objetselectionne);

    }
    function deleteObjectAndButton(e) {

        var objselected = tableauNewForm[e - 1];
        canvas.remove(objselected);
        canvas.renderAll();
        var element = document.getElementById("ligne" + e + "");
        element.parentNode.removeChild(element);

    }


    function updateControls(e) {

        angleControl.value = e.target.getAngle();
        leftControl.value = e.target.getLeft();
        topControl.value = e.target.getTop();
    }
    function updateCtrls(obj) {

        angleControl.value = obj.getAngle();
        leftControl.value = obj.getLeft();
        topControl.value = obj.getTop();
    }
    function onChange(options) {
        options.target.setCoords();
        canvas.forEachObject(function (obj) {
            if (obj === options.target)
                return;
            obj.setOpacity(options.target.intersectsWithObject(obj) ? 0.5 : 1);
        });
    }

});



