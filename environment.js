var Environment = {

    mouse: {

        x: null,
        y: null

    },

    checkKeys: function(event){

        if(event.altKey){

            $('body').addClass('alt-key');

        } else{

            $('body').removeClass('alt-key');

        }

        if(event.ctrlKey){

            $('body').addClass('ctrl-key');

        } else{

            $('body').removeClass('ctrl-key');

        }

        if(event.shiftKey){

            $('body').addClass('shift-key');

        } else{

            $('body').removeClass('shift-key');

        }

    },

    drag: {

        startX: null,
        startY: null,
        elm: null,

        pseudoX: null,
        pseudoY: null,

        notUntil: 10,

        // Permite que o elemento especificado torne-se arrastável
        bind: function(elm, opts){

            if(typeof opts === 'undefined') opts = {
                notUntil: Environment.drag.notUntil
            }

            if(!opts.ready) opts.ready = function(){}

            elm = $(elm);

            Environment.drag.pseudoX = null;
            Environment.drag.pseudoY = null;

            elm.on('mousedown', function(event){

                Environment.drag.pseudoX = event.clientX;
                Environment.drag.pseudoY = event.clientY;

            });

            elm.on('mousemove', function(event){

                if($('.calendar-holder.mini').length) return;

                if(!Environment.drag.pseudoX || !Environment.drag.pseudoY) return;
                if(Environment.drag.elm) return;

                if($(document.activeElement).attr('contenteditable')) return;

                var absX = Environment.drag.pseudoX - event.clientX;
                var absY = Environment.drag.pseudoY - event.clientY;

                var h = Helpers.math.hypotenuse(null, absX, absY);

                if(h > opts.notUntil){

                    opts.ready(elm);

                    Environment.drag.startX = Environment.drag.pseudoX;
                    Environment.drag.startY = Environment.drag.pseudoY;
                    Environment.drag.elm    = elm.clone();

                    Environment.drag.elm.css('width', elm.width());

                    Environment.drag.elm.css('bottom',         'unset');
                    Environment.drag.elm.css('transition',     'unset');
                    Environment.drag.elm.css('pointer-events', 'none');

                    Environment.drag.elm.on('resetdrag', function(event){

                        // Caso tenha alguma mira e não seja o mesmo elemento, ou melhor, arrastando para si emsmo
                        if(Items.dragAim && elm.attr('item-id') != Items.dragAim.attr('item-id')){

                            Items.changeFather(elm.attr('item-id'), Items.dragAim.attr('item-id'));

                        }

                        Environment.drag.elm.remove();

                    });

                    Environment.drag.elm.addClass('environment-drag');

                    elm.parent().append(Environment.drag.elm);

                }

            });

        },

        reset: function(){

            Environment.drag.startX = null;
            Environment.drag.startY = null;

            Environment.drag.pseudoX = null;
            Environment.drag.pseudoY = null;

            Environment.drag.elm.trigger('resetdrag');

            // Determina que começamos a remover um elemento
            Environment.drag.removing = Environment.drag.elm;

            // Depois de 500ms, acaba-se de remover o elemento
            // a escolha do tempo não foi baseado em nada
            setTimeout(function(){

                Environment.drag.removing = false;

            }, 500);

            Environment.drag.elm = null;

            Environment.drag.tick();

        },

        tick: function(){

            if(Environment.drag.elm){

                $('body').addClass('dragging-item');

                Navbar.updateWidth();

                Environment.drag.elm.css('transform', 'translateX(' + Environment.mouse.x + 'px) translateY(' + Environment.mouse.y + 'px)');

                Environment.drag.elm.ternaryClass(Items.dragAim, 'drag-item-droppable');

                if(Items.dragAim){

                    var itemLabel = Items.dragAim.find('.item-label').text();

                    var tooltip = Environment.drag.elm.find('.drag-tooltip');

                    if(tooltip.length === 0){

                        Environment.drag.elm.append('<span class="drag-tooltip"></span>')

                    }

                    Environment.drag.elm.find('.drag-tooltip').htmlIfNeed('Movendo para ' + itemLabel);

                } else{

                    Environment.drag.elm.find('.drag-tooltip').remove();

                }

            } else{

                $('body').removeClass('dragging-item');

                Navbar.updateWidth();

            }

        }

    },

    mousemovetick: function(event){

        Environment.checkKeys(event);

        if(!event.altKey){
            $('body').removeClass('alt-key');
        }

        if(Environment.drag.elm){

            Environment.drag.tick();

        }

    },

    geo: {

        lat: null,
        lon: null,

        set: function(position){

            Environment.geo.lat = position.coords.latitude;
            Environment.geo.lon = position.coords.longitude;

        },

        setErr: function(){

            // @todo

        },

        loopInit: function(){

            setInterval(function(){

                navigator.geolocation.getCurrentPosition(Environment.geo.set, Environment.geo.setErr);

            }, 4000);

        }

    }

}

$(document).on('mousemove', function(event){

    Environment.mouse.x = event.clientX;
    Environment.mouse.y = event.clientY;
    Environment.mouse.which = event.which;

    Environment.mousemovetick(event);

    if(Environment.drag.elm && event.which === 0){

        Environment.drag.reset();

    }

});

$(document).on('mouseup', function(event){

    if($('.calendar-holder.mini').length){

        $('.calendar-holder.mini').remove();

    }

    if(Environment.drag.elm){

        Environment.drag.reset();

    }

});

if(location.protocol === 'https:'){

    Environment.geo.loopInit();

}