const Beer = require('./model/Beermodel') //Beer
const Beertypes = require('./model/Beertypes') //Beertypes
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const fs = require('fs')
//De er ligesom using 

module.exports = (app) => {
    //FORSIDE
    //get
    app.get("/", (req, res) => {
        let title = 'Forside';
        let beers = [0.5, 0.8, 1.0, 1.1, 1.5, 2.0, 3.0, 3.5, 4.0, 5.5, 6];

        res.render("Index",
            {
                title,
                beers

            });
    });
    //OM OPGAVE
    //get 
    app.get("/test", (req, res) => {
        res.render("test");
    });
    //ADMIN - ikke i brug
    //get 
    app.get("/admin", (req, res) => {
        res.render("admin");
    });

//----------------------------------------BEER ADMIN------------------------------------------------------------------------//

    //Get 
    app.get('/admin/beer', async (req, res) => {
        let beers = await Beer.find();
        let types = await Beertypes.find();
        res.render('beer', {
            beer: {},
            beers,
            types
        });
    });

    //POST beer /CREATE
    app.post('/admin/beer', async (req, res) => {
        //Hvis felterne ikke bliver udfyldt..
        let messages = [];

        if (req.body.navn == null || req.body.navn == '') {
            messages.push('Udfyld navn')
        }
        if (req.body.farve == null || req.body.farve == '') {
            messages.push('Udfyld farve')
        }
        if (req.body.produktions == null || req.body.produktions == '' || req.body.produktions == 'vælg år') {
            messages.push('Udfyld år')
        }
        if (req.body.type == null || req.body.type == '' || req.body.type == 'Vælg type') {
            messages.push('Udfyld type')
        }
        if (req.body.procenter == null || req.body.procenter == '') {
            messages.push('Udfyld procenter')
        }

        if (messages.length > 0) //tjekker om det skrevet er større end 0 og hvis den er skal den..
        {
            let types = await Beertypes.find();
            res.render('beer', {
                beer: req.body,
                types,
                message: messages.join(',')
            })
        }
        else
        {
            //BILLEDE

            //grib medsendete billede
        let file = req.files?.billede;
        //kun hvis medsendt
        if (file != null) {
            let name = uuidv4() + path.extname(file.name);
            //Gem billede på public mappen
            await file.mv('./public/Images/' + name); //./public/Images 
            //gem navn
            file = name;
        }

        console.log('admin post', req.body);

        //få fat i vores model
        //Beer.create(req.body);

        //CREATE
        Beer.create({
            navn: req.body?.navn,
            farve: req.body?.farve,
            procenter: req.body?.procenter,
            produktions: req.body?.produktions,
            type: req.body?.type,
            billede: file
        }, (err, beer) => {
            if (err) { console.log(err); }
            res.redirect('/admin/beer');
        })
        }
        
    });

    //EDIT 
    //GET
    app.get('/admin/beer/edit/:beerId',  (req, res) => {
        Beer.findById(req.params.beerId, async (err, beer) => {
            if (err) {
                console.log(err);
                res.redirect(404, '/admin/beer')
            }
            else {
                let types = await Beertypes.find();
                res.render('beer', {
                    beer,
                    types
                })
            }
        });
    });

    //EDiT - POST
    //Get
    app.post('/admin/beer/edit/:beerId', async (req, res) => {
        //Hvis felterne ikke bliver udfyldt..
        let messages = [];

        if (req.body.navn == null || req.body.navn == '') {
            messages.push('Udfyld navn')
        }
        if (req.body.farve == null || req.body.farve == '') {
            messages.push('Udfyld farve')
        }
        if (req.body.produktions == null || req.body.produktions == '' || req.body.produktions == 'vælg år') {
            messages.push('Udfyld år')
        }
        if (req.body.procenter == null || req.body.procenter == '') {
            messages.push('Udfyld procenter')
        }
        if (req.body.type == null || req.body.type == '' || req.body.type == 'Vælg type') {
            messages.push('Udfyld type')
        }

        if (messages.length > 0) //større end 0
        {
            let types = await Beertypes.find();
            res.render('beer', {
                beer: req.body,
                types,
                message: messages.join(',')
            })
        }
        else {
            Beer.findById(req.params.beerId, async (err, beer) => {
                if (err) {
                    console.log(err);
                    res.redirect(404, '/admin/beer')
                }
                else {
                    if (req.body.navn && req.body.navn != '') {
                        beer.navn = req.body?.navn;
                    }
                    //POST ændret

                    beer.farve = (req.body.farve && req.body.farve != '' ? req.body.farve : beer.farve);
                    beer.navn = (req.body.navn && req.body.navn != '' ? req.body.navn : beer.navn);
                    beer.produktions = (req.body.produktions && req.body.produktions != '' ? req.body.produktions : beer.produktions);
                    beer.procenter = (req.body.procenter && req.body.procenter != '' ? req.body.procenter : beer.procenter);
                    beer.type = (req.body.type && req.body.type != '' ? req.body.type : beer.type);
                    beer.billede = (req.body.billede && req.body.billede != '' ? req.body.billede : beer.billede);

                    //BILLEDE
                    //grib medsendete billede
                    let file = req.files?.billede;
                    //kun hvis medsendt
                    if (file != null) {
                        if (beer.billede != null || beer.billede != '') {
                            if (fs.existsSync('/public/Images/' + beer.billede)) {
                                fs.unlinkSync('/public/Images/' + beer.billede);
                            }
                        }
                        //gemmer nyt navn på ny billede

                        let name = uuidv4() + path.extname(file.name);
                        //Gem billede på public mappen
                        await file.mv('./public/Images/' + name);
                        //gem navn
                        beer.billede = name;
                    }
                    await beer.save();
                    res.redirect('/admin/beer');
                }

            });
        }
    });

    //DELETE
    //Get
    app.get('/admin/beer/delete/:beerId',  (req, res) => 
    { 
        Beer.findById(req.params.beerId, async(err, beer) =>{
            console.log(beer);
        if(beer.billede != null || beer.billede != '')
        {
            //findes det der slettes
            if(fs.existsSync('./public/Images/' + beer.billede)) //Det er en sti på serveren
            {
              fs.unlinkSync('./public/Images/' + beer.billede); //Det er en sti på serveren
            }
        }
        //slet
        await Beer.deleteOne({ _id: req.params.beerId });
        //tilbage til admin side
        res.redirect('/admin/beer');
    });
    });
    //REMOVE
    //Get
    app.get('/admin/beer/:beerId/Images/remove', (req, res) =>{
        Beer.findById(req.params.beerId, async(err, beer)=>
        {
            if(beer.billede != null || beer.billede != '')
            {
                if(fs.existsSync('./public/Images/' + beer.billede)) //Det er en sti på serveren
                {
                    fs.unlinkSync('./public/Images/' + beer.billede); //Det er en sti på serveren
                }
                beer.billede = null;
                await beer.save();
            }
        });
        res.redirect(`/admin/beer/edit/${req.params.beerId}`);
    })

    //---------------------------------------------------øltype----------------------------------------------------------------------//


    //GET
    app.get('/beertypes', async (req, res) => {
        let beertypes = await Beertypes.find();
        res.render('beertypes', {
            beertype: {},
            beertypes
        });
    });

   //POST beer /CREATE
    app.post('/beertypes', (req, res) => {
        //Hvis felterne ikke bliver udfyldt..
        let messages = [];

        if (req.body.type == null || req.body.type == '') {
            messages.push('udfyld type')
        }
        if (req.body.beskrivelse == null || req.body.beskrivelse == '') {
            messages.push('udfyld beskrivelse')
        }

        if (messages.length > 0) //større end 0
        {
            res.render('Beertypes', {
                beertypes: req.body,
                message: messages.join(',')
            })
        }
        else
        {
            console.log('admin post', req.body);

            //få fat i vores model
            //Beer.create(req.body);

            //CREATE
            Beertypes.create({
                type: req.body?.type,
                beskrivelse: req.body?.beskrivelse
            }, (err, Beertypes) => {
                if (err) { console.log(err); }
                res.redirect('/beertypes');
            })
        }
        
    });

    //EDIT
    app.get('/beertypes/edit/:beerId', (req, res) => {
        Beertypes.findById(req.params.beerId, (err, beertypes) => {
            if (err) {
                console.log(err);
                res.redirect(404, '/beertypes')
            }
            else {
                res.render('beertypes', {
                    beertypes
                })
            }
        });
    });

    //EDIT - POST
    //POST
    app.post('/beertypes/edit/:beerId', (req, res) => {
        //Hvis felterne ikke bliver udfyldt..
        let messages = [];

        if (req.body.type == null || req.body.type == '') {
            messages.push('udfyld type')
        }
        if (req.body.beskrivelse == null || req.body.beskrivelse == '') {
            messages.push('udfyld beskrivelse')
        }

        if (messages.length > 0) //større end 0
        {
            res.render('Beertypes', {
                beertypes: req.body,
                message: messages.join(',')
            })
        }
        else {
            Beertypes.findById(req.params.beerId, async (err, beertypes) => {
                if (err) {
                    console.log(err);
                    res.redirect(404, '/beertypes')
                }
                else {
                    if (req.body.tyoe && req.body.type != '') {
                        beer.type = req.body?.type;
                    }
                    beertypes.type = (req.body.type && req.body.type != '' ? req.body.type : beertypes.type);
                    beertypes.beskrivelse = (req.body.beskrivelse && req.body.beskrivelse != '' ? req.body.beskrivelse : beertypes.beskrivelse);

                    await beertypes.save();
                    res.redirect('/beertypes');
                }

            });
        }
    });

    //DELETE
    app.get('/beertypes/delete/:beerId', async (req, res) => {
        await Beertypes.deleteOne({ _id: req.params.beerId });
        res.redirect('/beertypes');
    });

}
