let Cureentsong = new Audio();
let songs;
let crrfolder;

function formatSecondsToMinutes(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    // Pad with leading zeros if needed
    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');

    return `${formattedMins}:${formattedSecs}`;
}

// get the songs from the folder 
async function getsongs(folder) {
    crrfolder = folder;

   let a = await fetch("/mitraz/info.json")

    let response = await a.json();
    songs = response.songs;

    // Build the song list
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songul.innerHTML = "";

    for (const song of songs) {
        songul.innerHTML += `<li>
            <img class="invert" src="img/music.svg" alt="Music">
            <div class="info">
                <div>${decodeURIComponent(song)}</div>
                <div>Netra</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img src="img/play.svg" alt="" class="invert" width="30px">
            </div>  
        </li>`;
    }

    // Add event listeners
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            const trackName = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playMusic(trackName);
        });
    });

    return songs;
}


const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    Cureentsong.src = "/mitraz/" + track
    if (!pause) {

        Cureentsong.play();
        Play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function Displayalbum() {
    let a = await fetch("/songs/album.json")
    let folders = await a.json()
    
    let cardcontainer = document.querySelector(".cardcontainer")
    
    for (const folder of folders) {
        let meta = await fetch(`/songs/${folder}/info.json`)
        let response = await meta.json();
    
        cardcontainer.innerHTML += `<div data-folder="${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24.96 24.96">
                    <circle cx="12.48" cy="12.48" r="12" fill="#90ee90" />
                    <polygon points="9.36,7.32 17.68,12.48 9.36,17.68" fill="black" />
                </svg>
            </div>
            <img src="/songs/mitraz/Cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`;
    }
    

    // load the play list whenever the card is clicked 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(item, item.currentTarget.dataset);
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        })
    })

}

async function main() {


    // get the list of all the songs 
    await getsongs("songs/mitraz")
    console.log(songs)

    playMusic(songs[0], true)

    // Display all the items dynamicaly on the page 
    Displayalbum();

    // Attach eventlistener to the play, next and previous

    Play.addEventListener("click", () => {
        if (Cureentsong.paused) {
            Cureentsong.play();
            Play.src = "img/pause.svg";
        } else {
            Cureentsong.pause();
            Play.src = "img/play.svg";
        }
    })

    // Time update of song 
    Cureentsong.addEventListener("timeupdate", () => {
        // console.log(Cureentsong.currentTime, Cureentsong.duration);
        document.querySelector(".songtime").innerHTML = `${formatSecondsToMinutes(Cureentsong.currentTime)}/${formatSecondsToMinutes(Cureentsong.duration)}`
        document.querySelector(".circle").style.left = (Cureentsong.currentTime / Cureentsong.duration) * 100 + "%";
    })

    // add event listener to the seekbar 
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = (percent) + "%";
        console.log(Cureentsong.duration, percent);
        Cureentsong.currentTime = (Cureentsong.duration * percent) / 100;
    })

    // add event listener to the hamburger 
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%";
    })

    // add event listener to the close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    // add event listner to previous 
    previous.addEventListener("click", () => {

        let index = songs.indexOf(Cureentsong.src.split("/").slice(-1)[0])
        console.log(songs, index);
        // console.log(Cureentsong.src.split("/").[4]);
        playMusic(songs[(index - 1 + songs.length) % songs.length]);

    })

    // add event listner to next 
    Next.addEventListener("click", () => {

        let index = songs.indexOf(Cureentsong.src.split("/").slice(-1)[0])
        console.log(songs, index);
        // console.log(Cureentsong.src.split("/").[4]);
        playMusic(songs[(index + 1) % songs.length]);

    })

    // add event to volume 
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e, e.target, e.target.value);
        Cureentsong.volume = parseInt(e.target.value) / 100;
    })

    // add event listner to mute the track 
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            Cureentsong.muted = true;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            Cureentsong.muted = false;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20;

        }
    })

}


main()


