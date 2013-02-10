window.appLoad = function(gui) {
    var fs = require("fs");
    var Path = require("path");

    var ace = window.ace;

    var editor = ace.edit("editor");
    var editorSession = editor.getSession();
    // name: ["Menu caption", "extensions", "content-type", "hidden|other"]
    var SupportedModes = {
        abap: ["ABAP", "abap", "text/x-abap", "other"],
        asciidoc: ["AsciiDoc", "asciidoc", "text/x-asciidoc", "other"],
        c9search: ["C9Search", "c9search", "text/x-c9search", "hidden"],
        c_cpp: ["C, C++", "c|cc|cpp|cxx|h|hh|hpp", "text/x-c"],
        clojure: ["Clojure", "clj", "text/x-script.clojure"],
        coffee: ["CoffeeScript", "*Cakefile|coffee|cf", "text/x-script.coffeescript"],
        coldfusion: ["ColdFusion", "cfm", "text/x-coldfusion", "other"],
        csharp: ["C#", "cs", "text/x-csharp"],
        css: ["CSS", "css", "text/css"],
        dart: ["Dart", "dart", "text/x-dart"],
        diff: ["Diff", "diff|patch", "text/x-diff", "other"],
        glsl: ["Glsl", "glsl|frag|vert", "text/x-glsl", "other"],
        golang: ["Go", "go", "text/x-go"],
        groovy: ["Groovy", "groovy", "text/x-groovy", "other"],
        haml: ["Haml", "haml", "text/haml", "other"],
        haxe: ["haXe", "hx", "text/haxe", "other"],
        html: ["HTML", "htm|html|xhtml", "text/html"],
        jade: ["Jade", "jade", "text/x-jade"],
        java: ["Java", "java", "text/x-java-source"],
        jsp: ["JSP", "jsp", "text/x-jsp", "other"],
        javascript: ["JavaScript", "js", "application/javascript"],
        json: ["JSON", "json", "application/json"],
        jsx: ["JSX", "jsx", "text/x-jsx", "other"],
        latex: ["LaTeX", "latex|tex|ltx|bib", "application/x-latex", "other"],
        less: ["LESS", "less", "text/x-less"],
        lisp: ["Lisp", "lisp|scm|rkt", "text/x-lisp", "other"],
        liquid: ["Liquid", "liquid", "text/x-liquid", "other"],
        lua: ["Lua", "lua", "text/x-lua"],
        luapage: ["LuaPage", "lp", "text/x-luapage", "other"],
        makefile: ["Makefile", "*GNUmakefile|*makefile|*Makefile|*OCamlMakefile|make", "text/x-makefile", "other"],
        markdown: ["Markdown", "md|markdown", "text/x-markdown", "other"],
        objectivec: ["Objective-C", "m", "text/objective-c", "other"],
        ocaml: ["OCaml", "ml|mli", "text/x-script.ocaml", "other"],
        perl: ["Perl", "pl|pm", "text/x-script.perl"],
        pgsql: ["pgSQL", "pgsql", "text/x-pgsql", "other"],
        php: ["PHP", "php|phtml", "application/x-httpd-php"],
        powershell: ["Powershell", "ps1", "text/x-script.powershell", "other"],
        python: ["Python", "py", "text/x-script.python"],
        r: ["R", "r", "text/x-r", "other"],
        rdoc: ["RDoc", "Rd", "text/x-rdoc", "other"],
        rhtml: ["RHTML", "Rhtml", "text/x-rhtml", "other"],
        ruby: ["Ruby", "ru|gemspec|rake|rb", "text/x-script.ruby"],
        scad: ["OpenSCAD", "scad", "text/x-scad", "other"],
        scala: ["Scala", "scala", "text/x-scala"],
        scss: ["SCSS", "scss|sass", "text/x-scss"],
        sh: ["SH", "sh|bash|bat", "application/x-sh"],
        stylus: ["Stylus", "styl|stylus", "text/x-stylus"],
        sql: ["SQL", "sql", "text/x-sql"],
        svg: ["SVG", "svg", "image/svg+xml", "other"],
        tcl: ["Tcl", "tcl", "text/x-tcl", "other"],
        text: ["Text", "txt", "text/plain", "hidden"],
        textile: ["Textile", "textile", "text/x-web-textile", "other"],
        typescript: ["Typescript", "ts|str", "text/x-typescript"],
        xml: ["XML", "xml|rdf|rss|wsdl|xslt|atom|mathml|mml|xul|xbl", "application/xml"],
        xquery: ["XQuery", "xq", "text/x-xquery"],
        yaml: ["YAML", "yaml", "text/x-yaml"]
    };
    var fileExtensions = {}, ModesCaption = {}, contentTypes = {}, hiddenMode = {}, otherMode = {};
    Object.keys(SupportedModes).forEach(function(name) {
        var mode = SupportedModes[name];
        mode.caption = mode[0];
        mode.mime = mode[2];
        mode.hidden = mode[3] == "hidden" ? true : false;
        mode.other = mode[3] == "other" ? true : false;
        mode.ext = mode[1];
        mode.ext.split("|").forEach(function(ext) {
            fileExtensions[ext] = name;
        });
        ModesCaption[mode.caption] = name;
        hiddenMode[mode.caption] = mode.hidden;
        otherMode[mode.caption] = mode.other;
        contentTypes[mode.mime] = name;
    });

    var hasChanged = false,
        currentFile = null;

    if (process && process._nw_app && fs.existsSync(process._nw_app.argv[0])) {
        try{
            openFile(process._nw_app.argv[0]);
        }catch(e){
            console.log(e);
        }
    }


    editorSession.on("change", function() {
        if (currentFile) {
            hasChanged = true;
            $("title").text("*" + currentFile);
        }
    });

    $(window).keypress(function(event) {
        if (!currentFile) return false;
        if (!(event.which == 115 && event.ctrlKey) && event.which !== 19) return true;
        saveFileFN();
        event.preventDefault();
        return false;
    });

    function openFile(path) {
        if (hasChanged && !saveFileFN(true)) return false;
        currentFile = null;
        if (path) {
            var fileMode = fileExtensions[Path.basename(path).split(".")[1]];
            if (fileMode) {
                editor.getSession().setMode("ace/mode/" + fileMode);
            }
            hasChanged = false;
            editor.getSession().setValue(fs.readFileSync(path, "utf8"));
            hasChanged = false;
        }
        else {
            path = "Untitled";
            editor.getSession().setValue("");
        }

        currentFile = path;
        $("title").text(currentFile);
    }
    function saveasDialog(name) {
        var chooser = $(name);
        chooser.trigger('click');
        chooser.change(function(evt) {
            var saveFilename = $(this).val();
            currentFile = saveFilename;
            hasChanged = true;
            saveFileFN();
        });
    }
    function saveFileFN() {
        if (hasChanged && currentFile !== "Untitled") {
            var data = editor.getSession().getValue(); //.replace(/\n/g,"\r\n");
            if(currentFile == "Untitled"){
                saveasDialog('#saveasDialog');
            }else{
                fs.writeFileSync(currentFile, data, "utf8");
                $("title").text(currentFile);
                hasChanged = false;
            }
        }else{
            saveasDialog('#saveasDialog');
        }
    }

    $("#newFile").click(function() {
        if (confirm("All Changes will be lost?")) {
            openFile();
        }
    });
    $("#openFile").click(function() {
        function chooseFile(name) {
            var chooser = $(name);
            chooser.trigger('click');
            chooser.change(function(evt) {
                var openFilename = $(this).val();
                openFile(openFilename);
            });
        }
        chooseFile('#openfileDialog');
    });
    $("#saveFile").click(function() {
        saveFileFN();
    });
    $("#saveasFile").click(function() {
        saveasDialog('#saveasDialog');
    });

    var win = gui.Window.get();
    win.on('close', function() {
        function disp_confirm() {
            var r = confirm("Press a button!");
            if (r === true) {
                alert("You pressed OK!");
            }
            else {
                this.close(true);
            }
        }
        win.close(true);
    });

    $("#windowClose").click(function() {
        win.close();
    });
};