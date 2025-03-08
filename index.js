import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
//1	"Deep Work"	"Cal NewPort"	9780349413686	"1-2025 3-2025"	10	"Lorem Ipsum is simplyn urvived as popularised in the 1960s with the release of Let."
const db=new pg.Client({
        user:"postgres",
        host:"localhost",
        port:5432,
        password:"Reshmi@123",
        database:"book_notes"
});
db.connect();


const app=express();
const port=3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

let data=[];


//<img src="https://covers.openlibrary.org/b/isbn/9780349413686-M.jpg" />

app.get("/",(req,res)=>{
        res.render("welcompage.ejs");
})
//send all books data
app.get("/all",async (req,res)=>{
        try{
                const result =await db.query("SELECT * FROM data ORDER BY rating DESC;");
                data=result.rows;
                res.render("index.ejs", {content:data});
        }catch(err){
                console.log(err);
        }
        
})

// send a specific book detail
app.get("/read/:id",async(req,res)=>{
        try{
                const id=parseInt(req.params.id);
                const result =await db.query("SELECT * FROM data ORDER BY rating DESC;");
                data=result.rows;
                //const isbn=req.body.isbn;
                //const book=db.query("SELECT * FROM data WHERE isbn= $1",[isbn]);
                const book = data.find((book)=>book.id===id);
                res.render("fullRead.ejs",{
                        book:book
                });
        }catch(err){
                console.log(err);

        }
        
});  
app.get("/addbook",(req,res)=>{
        res.render("modifies.ejs",{heading:"Add a New Notes"});
})

// update data
app.get("/edit/:id",async(req,res)=>{ 
        const id=parseInt(req.params.id);
        try{ 
                //const id=req.body.id;
                //const bookI=db.query("SELECT * FROM data WHERE isbn= $1",[isbn]);
                const book = data.find((book)=>book.id==id);
                
                res.render("modifies.ejs",{
                        book:book,
                        heading:"Edit in Notes"
                });
        }catch(err){
                console.log(err);

        }
})

app.post("/update",async(req,res)=>{

        try{
                const id=req.body.id;
                const previousBook=data.find((book)=>book.id==id);
                const bookname=req.body.bookname|| previousBook.bookname;
                const dateofread=req.body.dateofread|| previousBook.dateofread;
                const rating=req.body.rating|| parseInt(previousBook.rating);
                const bookauthor=req.body.bookauthor|| previousBook.bookauthor;
                const summary=req.body.summary|| previousBook.summary;
                const notes=req.body.notes|| previousBook.notes;
                const isbn=req.body.isbn|| previousBook.isbn;
                console.log(bookauthor);
                console.log(rating);
                
                await db.query("UPDATE data SET bookname=$1,dateofread=$2,rating=$3,bookauthor=$4,summary=$5,notes=$6,isbn=$7 WHERE isbn=$7",[bookname,dateofread,rating,bookauthor,summary,notes,isbn]);
                res.redirect("/read/"+id);
        }catch(err){
                console.log(err);
        }
        
});

app.post("/add",async(req,res)=>{
        try{
                const isbn=req.body.isbn;
                const bookname=req.body.bookname;
                const dateofread=req.body.dateofread;
                const rating=req.body.rating;
                const bookauthor=req.body.bookauthor;
                const summary=req.body.summary;
                const notes=req.body.notes;
                await db.query("INSERT INTO data (bookname, dateofread,bookauthor,summary,notes,isbn,rating) VALUES ($1,$2,$3,$4,$5,$6,$7);",[bookname,dateofread,bookauthor,summary,notes,isbn,rating]);
                res.redirect("/all");
        }catch(err){ 
                console.log(err);
        }
        
});

app.get("/delete/:id",async(req,res)=>{
        const id=parseInt(req.params.id);
        await db.query("DELETE FROM data WHERE id=$1",[id]);
        res.redirect("/all");
})

app.listen(port,()=>{
        console.log(`File is running on port ${port}`);
});

