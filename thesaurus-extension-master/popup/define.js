(function() {
    /* global $ */

    var recentSearch;
    var queryPrefix = "https://www.google.com/search?q=define+";
    var textV = "";
    /* FIXME: this file has duplicate functions:
    * e.g. formatResponse, getDefinition
    * This should be improved.
    */
   
    function formatResponse(result) {
        var resultHtml = "",
            definitions;
        var googleQuery, searchMore;
        
        resultHtml += "<b>" + result.searchText + "</b>&nbsp";
        if (result.pronounciation) {
            resultHtml += result.pronounciation;
           
        }
        resultHtml +=
            '<span class="fa fa-microphone" id="text_speech" aria-hidden="true" style="font-size:20px;margin-left:10px"></span><a id="closeBtnEPD" style="float:right;padding:2px 5px;">X</a><br/><br/>';
       
        if(result.status == "success")
        {
            definitions = "<div style='box-sizing: border-box;padding: 0 10px 0 10px;  line-height: 2.0'>" + result.definitions +  "</div>" +"<br />" 
        }
        else
        {
           definitions = "<div style='box-sizing: border-box;padding: 0 10px 0 10px;  line-height: 2.0'>No Results</div>";
        }
       
       
        ;
         
        googleQuery = queryPrefix + result.searchText;
        searchMore =
            "<br/><a href='" +
            googleQuery +
            "'style='float:left; color:blue' target='_blank'>More</a>";
        resultHtml += definitions + searchMore;
     
         
       
        
       
         
        
        
        return resultHtml;
    }
    
    function setVoice(text){
        textV = text;
    }
    
    function getVoice(){
        return textV;
    }
    
    function updateDom(result) {
        if (result.status !== "success") {
            $("result").html("Error while fetching definitions");
        }

        $("#result").html(formatResponse(result));
    }

    function getDefinition(searchText, callback) {
        localStorage.removeItem("recentSearchText");
        var definitionApi = "https://googledictionaryapi.eu-gb.mybluemix.net/?define=" + searchText;

        var result = {
            searchText: searchText,
            definitions: "",
            pronounciation: "",
            status: "",
            names: ""
         
        };
        
        $.when($.getJSON(definitionApi))
            .then(function(data) {
                result.pronounciation = data[0].phonetic;
                var definition = "";
                var name ="";
                if(data[0] && data[0].meaning){
                    var meanings = data[0].meaning;
                    var index = 1;
                    for(var meaning in meanings){
                        if(meanings.hasOwnProperty(meaning)){
                            definition += index+ ". (" + meaning + ") "+meanings[meaning][0].definition;
                            name += meanings[meaning][0].definition + " ";
                          
                            if(index != Object.keys(meanings).length){
                                definition += "<br />";
//                                name += " ";
                            }
                             
                        }
        
                        index++;
                    }
                    result.status = "success";
                    result.definitions = definition;
                    setVoice(name);
                }       
           
            })
            .fail(function() {
                result.status = "Ops, Sorry , we could't find definitions for the word you were looking for.";
                alert(result.status);
                
                
            })
            .always(function() {
                callback(result);
            });
             $(document).on('click','#text_speech',function(){
//                                                alert(getVoice());
                                                var voice = getVoice();
                                                var msg = new SpeechSynthesisUtterance(voice);
                                                window.speechSynthesis.speak(msg);
                                        }) 
                       
         

    }
    
    function requestDefinition(searchText) {
        searchText = (searchText || "").toString().trim();
        
        if(searchText == "")
        {
            return false;
        }
      
        // skip search on multi words select
        if (/\s+/.test(searchText)) {
            return;
        }

        localStorage.setItem("recentSearchText", searchText);
        getDefinition(searchText, updateDom);
    }

    //Get search engine url
    browser.storage.sync.get().then((data) => {
        queryPrefix = data.searchEngineUrl;
    });

    // enter-key listener
    document.getElementById("query").addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            requestDefinition($("#query").val());
        }
    });

    // click listener
    document
        .getElementById("submitButton")
        .addEventListener("click", function() {
            requestDefinition($("#query").val());
            
    
        });

   
 
    // load recent search in init
    recentSearch = localStorage.getItem("recentSearchText");
    if (recentSearch) {
        requestDefinition(recentSearch);
    }
    document.getElementById("query").focus();
})();
