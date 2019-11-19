const express = require('express');
const app = express();
var path = require('path');
const cp = require('child_process');
var Readable = require('stream').Readable;
var fs = require('fs');
const port = 3000;

// Access static files
app.use(express.static(path.join(__dirname,'public')));

// Parser of JSON and stores data to body in req
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.post('/run',(req,res) => {
    const spawn_options = {
        cwd: "/home/hardik/projects/compiler" ,
        shell : true ,
    };
    
    const exec_options = {
        cwd : "/home/hardik/projects/compiler",
    };

    fs.appendFile('test.c', req.body.code , function (err) {
        if (err) throw err;
        cp.exec("gcc test.c",exec_options,(error,stdout,stderr) => {
            if(error) {
                error = error.toString();
                res.send(error.substring(error.indexOf("\n")+1));
            }
            else if(stderr) {
                res.send(stderr.toString());
            }
            else {
                const execute_prog = cp.spawn('./a.out', [], spawn_options);
        
                execute_prog.stdin.setEncoding("utf-8");
                execute_prog.stdin.write(req.body.input+"\n");
        
                execute_prog.stdout.on("data",stdout => {
                    execute_prog.on("close",code => {
                        res.send(stdout.toString()+"\n\n...Program finished with exit code "+code.toString());
                    });
                });
        
                execute_prog.stderr.on("data",stderr => {
                    res.send(stderr.toString());
                });
            }
            cp.exec("rm --force test.c a.out",exec_options);
        });
    });
});

app.listen(port, () => console.log(`server listening on port ${port}!`));