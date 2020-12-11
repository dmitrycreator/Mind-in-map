$('#favcolor').change(function(){
    $('#hex').value($this.value());
    $console.log(this.value);
});

/**************************** color to text ****************************/
$(document).ready(function(){
    
    $('#favcolor').change(function(){
        $('#hex').val($(this).val());
        console.log($(this).val());
    });

    $('#favcolor1').change(function(){
        $('#hex1').val($(this).val());
        console.log($(this).val());
    });

    $('#favcolor2').change(function(){
        $('#hex2').val($(this).val());
        console.log($(this).val());
    });

    $('#favcolor3').change(function(){
        $('#hex3').val($(this).val());
        console.log($(this).val());
    });

    $('#favcolor4').change(function(){
        $('#hex4').val($(this).val());
        console.log($(this).val());
    });

    /**************************** text to color ****************************/

    $('#hex').change(function(){
        $('#favcolor').val($(this).val());
        console.log($(this).val());
    });

    $('#hex1').change(function(){
        $('#favcolor1').val($(this).val());
        console.log($(this).val());
    });

    $('#hex2').change(function(){
        $('#favcolor2').val($(this).val());
        console.log($(this).val());
    });

    $('#hex3').change(function(){
        $('#favcolor3').val($(this).val());
        console.log($(this).val());
    });

    $('#hex4').change(function(){
        $('#favcolor4').val($(this).val());
        console.log($(this).val());
    });

    $(document).on('dblclick', '#Tab1', function(){
        var sourceText = document.getElementById("Tab1").textContent;
        $('#Tab1').replaceWith('<input class="homeTab nav-item nav-link bg-white active" id="Tab1" data-toggle="tab" href="#nav-tab1" role="tab" aria-controls="nav-tab1" aria-selected="true" style="margin-right: .25rem;">')
        $('#Tab1').focus();
        $('#Tab1').keydown(function(e) {
            if(e.keyCode == 13) {
                var newText = $(this).val();
                if (newText != "") {
                    currentText = newText;
                }
                else{
                    currentText = sourceText;
                }
                $('#Tab1').replaceWith('<a class="homeTab nav-item nav-link bg-white active" id="Tab1" data-toggle="tab" href="#nav-tab1" role="tab" aria-controls="nav-tab1" aria-selected="true" style="margin-right: .25rem;"></a>')
                $('#Tab1').text(currentText);
            }
        });
        $('#Tab1').focusout(function(){
            var newText = $(this).val();
                if (newText != "") {
                    currentText = newText;
                }
                else{
                    currentText = sourceText;
                }
            $('#Tab1').replaceWith('<a class="homeTab nav-item nav-link bg-white active" id="Tab1" data-toggle="tab" href="#nav-tab1" role="tab" aria-controls="nav-tab1" aria-selected="true" style="margin-right: .25rem;"></a>')
            $('#Tab1').text(currentText);
        });
    });

    $(document).on('dblclick', '#Tab2', function(){
        var sourceText = document.getElementById("Tab2").textContent;
        $('#Tab2').replaceWith('<input class="homeTab nav-item nav-link bg-white active" id="Tab2" data-toggle="tab" href="#nav-tab2" role="tab" aria-controls="nav-tab2" aria-selected="false" style="margin-right: .25rem;">')
        $('#Tab2').focus();
        $('#Tab2').keydown(function(e) {
            if(e.keyCode == 13) {
                var newText = $(this).val();
                if (newText != "") {
                    currentText = newText;
                }
                else{
                    currentText = sourceText;
                }
                $('#Tab2').replaceWith('<a class="homeTab nav-item nav-link bg-white active" id="Tab2" data-toggle="tab" href="#nav-tab2" role="tab" aria-controls="nav-tab2" aria-selected="false" style="margin-right: .25rem;"></a>')
                $('#Tab2').text(currentText);
            }
        });
        $('#Tab2').focusout(function(){
            var newText = $(this).val();
                if (newText != "") {
                    currentText = newText;
                }
                else{
                    currentText = sourceText;
                }
            $('#Tab2').replaceWith('<a class="homeTab nav-item nav-link bg-white active" id="Tab2" data-toggle="tab" href="#nav-tab2" role="tab" aria-controls="nav-tab2" aria-selected="false" style="margin-right: .25rem;"></a>')
            $('#Tab2').text(currentText);
        });
    });

    $(document).on('dblclick', '#Tab3', function(){
        var sourceText = document.getElementById("Tab3").textContent;
        $('#Tab3').replaceWith('<input class="homeTab nav-item nav-link bg-white active" id="Tab3" data-toggle="tab" href="#nav-tab3" role="tab" aria-controls="nav-tab3" aria-selected="false">')
        $('#Tab3').focus();
        $('#Tab3').keydown(function(e) {
            if(e.keyCode == 13) {
                var newText = $(this).val();
                if (newText != "") {
                    currentText = newText;
                }
                else{
                    currentText = sourceText;
                }
                $('#Tab3').replaceWith('<a class="homeTab nav-item nav-link bg-white active" id="Tab3" data-toggle="tab" href="#nav-tab3" role="tab" aria-controls="nav-tab3" aria-selected="false"></a>')
                $('#Tab3').text(currentText);
            }
        });
        $('#Tab3').focusout(function(){
            var newText = $(this).val();
                if (newText != "") {
                    currentText = newText;
                }
                else{
                    currentText = sourceText;
                }
            $('#Tab3').replaceWith('<a class="homeTab nav-item nav-link bg-white active" id="Tab3" data-toggle="tab" href="#nav-tab3" role="tab" aria-controls="nav-tab3" aria-selected="false"></a>')
            $('#Tab3').text(currentText);
        });
    });

    $('#infoBtn').click(function(){
        if ($('#menu1Info').css('display') == 'none') 
        {
            if ($('#menu1Share').css('display') == 'none' && $('#menu1Open').css('display') == 'none') {
                $('#menu1Info').animate({height: 'show'}, 500); 
            }
            else
            {
                $('#menu1Share').animate({height: 'hide'}, 500);
                $('#menu1Open').animate({height: 'hide'}, 500);
                $('#menu1Info').animate({height: 'show'}, 500); 
            }
        }
        else 
        {     
            $('#menu1Info').animate({height: 'hide'}, 500); 
        }
    });

    $('#shareBtn').click(function(){
        if ($('#menu1Share').css('display') == 'none') 
        {
            if ($('#menu1Info').css('display') == 'none' && $('#menu1Open').css('display') == 'none') {
                $('#menu1Share').animate({height: 'show'}, 500);    
            }
            else
            {
                $('#menu1Info').animate({height: 'hide'}, 500);
                $('#menu1Open').animate({height: 'hide'}, 500);
                $('#menu1Share').animate({height: 'show'}, 500); 
            }
        }
        else 
        {     
            $('#menu1Share').animate({height: 'hide'}, 500); 
        }
    });

    $('#openBtn').click(function(){
        if ($('#menu1Open').css('display') == 'none') 
        {
            if ($('#menu1Info').css('display') == 'none' && $('#menu1Share').css('display') == 'none') {
                $('#menu1Open').animate({height: 'show'}, 500);
            }
            else
            {
                $('#menu1Info').animate({height: 'hide'}, 500);
                $('#menu1Share').animate({height: 'hide'}, 500); 
                $('#menu1Open').animate({height: 'show'}, 500); 
            }
        }
        else 
        {     
            $('#menu1Open').animate({height: 'hide'}, 500); 
        }
    });
});