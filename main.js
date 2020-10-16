const axios = require('axios')
const { JSDOM } = require('jsdom')
const QueryString = require('query-string')
const dateFormat = require('dateformat')

const BANENOR_URL = 'https://www.banenor.no/Jernbanen/Stasjonssok/-K-/Kristiansand/'
const BANENOR_GETSTOP_URL = 'https://www.banenor.no/ws/getstopmonitoring'
const BANENOR_ENDSTATION = 'KRS'

//const NSB_URL = 'https://www.nsb.no/rutetider/tog-i-rute?to=Kristiansand&from=Egersund'
const NSB_API_URL = 'https://www.nsb.no/restful/tripinformation/getDetailedTripInformation?index=0'
const NSB_URL = 'https://booking.cloud.nsb.no/api/itineraries/search'
const NSB_TRIP_ID = '29fca08e-d0f6-4bd1-b10a-015c8734527b';

function nsbFilter(trip){
    return dateFormat(Date.parse(trip.arrivalScheduled), 'HH:MM') == "20:47"
}

async function nsb(){
    let request = await axios({
        method: 'post',
        url: NSB_URL,
        data: {
            from: 'Bryne',
            to: 'Kristiansand'
        }
    })
    let sesjonTrip;

    sesjonTrip = request.data['itineraries'].filter(nsbFilter)
    console.log('TOM', sesjonTrip)
    let info = request.data['itineraries']
    let resultSet = request.data.resultSetId;
    if (sesjonTrip.length == 0){
        let request = await axios({
            method: 'get',
            url: 'https://booking.cloud.nsb.no/api/resultsets/' + resultSet + '/earlier',
        })
        info = request.data['itineraries'][0];
        sesjonTrip = request.data['itineraries'].filter(nsbFilter);
        console.log(sesjonTrip)
    }
    if (sesjonTrip === undefined){
        sesjonTrip = info;
    }
    if (sesjonTrip){
        sesjonTrip = sesjonTrip[0]
        let tid = dateFormat(Date.parse(sesjonTrip.arrivalScheduled), 'HH:MM');
        let nyTid = sesjonTrip.arrivalRealTime ? dateFormat(Date.parse(sesjonTrip.arrivalRealTime), 'HH:MM'): '';
        return {
            tid,
            nyTid
        }
    } else {
        return {
            tid: '',
            nyTid: ''
        }
    }
}

/*
async function fetchNsb(){
 /*   let mainNsb = await axios.get(NSB_URL)
    let cookies = mainNsb.headers['set-cookie']
    console.log(mainNsb.headers)

    let request = await axios({
        method: 'get',
        url: NSB_API_URL/*,
        headers: {
            cookie: cookies.join(';')
        }
    })
    let info = request.data['detailedLegInformationList'][0].destination
    if (info){
        return {
            tid: dateFormat(Date.parse(info.datetime), 'HH:MM'),
            nyTid: dateFormat(Date.parse(info.rtDatetime), 'HH:MM')
        }
    } else {
        return {
            tid: '',
            nyTid: ''
        }
    }
}*/

async function baneNor() {
    let response = await axios.get(BANENOR_URL)
    let dom = new JSDOM(response.data)
    let verificationToken = dom.window.document.querySelector('input[name="__RequestVerificationToken"]').value
    
    let cookies = response.headers['set-cookie']

    form = QueryString.stringify( {
    'station': BANENOR_ENDSTATION,
    'direction': 'Arrival'
    })

    let request = await axios({
        method: 'post',
        url: BANENOR_GETSTOP_URL,
        data: form,
        headers: {
            'Cookie' : cookies.join(';'),
            '__RequestVerificationToken': verificationToken,
            'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
        }
    }).catch(err => {
 //       console.log(err)
    })
    let info = request.data.filter((train) => {
        let exp = RegExp('734:*')
        return train.DatedVehicleJourneyRef.match(exp)
    })
    if(info.length===0){
        info.push({
            AimedTime: '',
            DelayedTime: ''
        })
    }
    info = info[0]
    return {
        tid: info.AimedTime,
        nyTid: info.DelayedTime
    }
}

module.exports = (req,res) => {
    Promise.all([nsb,bNor], [nsb(), baneNor()]).then( ([nsb,bNor]) =>{
        res.end({nsb,bNor})
    })
}
nsb().then((res) => {
    console.log(res)
})