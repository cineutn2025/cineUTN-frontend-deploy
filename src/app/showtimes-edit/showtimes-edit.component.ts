import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ShowtimesByCinemaService } from '../showtimes-by-cinema/showtimes-by-cinema.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Show, Movie, Cinema, Language, Format } from '../interfaces/interfaces';
import { FormatWidth, getLocaleDateTimeFormat } from '@angular/common';

@Component({
  selector: 'app-showtimes-edit',
  templateUrl: './showtimes-edit.component.html',
  styleUrls: ['./showtimes-edit.component.css']
})
export class ShowtimesEditComponent implements OnInit{
  editMode :boolean = true
  showtimeForm!: FormGroup 
  cinema : Cinema = {
    id:0,
    address:"",
    movies: [],
    name: "",
    theaters: []
  }
  errorMessage: null | string = null;
  showtimeId : null | number = null;
  showtime: Show = {
    id: 0,
    dayAndTime: new Date(),
    finishTime: new Date(),
    format: {id: 0,
      formatName: ""
    },
    language : {
      id: 0,
      languageName: ""
    },
    movie : {
      id: 0,
      description:"",
      name:"",
      formats : [],
      languages: [],
      genres: [],
      imageLink: "",
    },
    theater : {id:0,cinema: 0,numChairs:0},
    tickets : []
  }
  selectedMovieId : number | null =  null;
  languages: Language[] = [];
  formats: Format[] = []

  constructor(
    private service : ShowtimesByCinemaService,
    private route : ActivatedRoute,
    private router: Router
  ){}
  
  ngOnInit() {
    this.cinema.id = this.route.snapshot.params["cid"];
    this.showtimeId = this.route.snapshot.params["sid"];
    this.showtimeForm = new FormGroup(
    {
      startDate: new FormControl("", [Validators.required]),
      finishDate : new FormControl("", [Validators.required]),
      selectMovieId : new FormControl(null, [Validators.required]),
      selectTheaterId : new FormControl(null, [Validators.required]),
      selectFormatId : new FormControl(null, [Validators.required]),
      selectLanguageId : new FormControl(null, [Validators.required])
    },{validators: this.checkDates});

    if (!this.showtimeId){
      this.editMode = false
    }else{
      this.editMode = true
    }
    this.loadCinema();
  }

  loadCinema() {
    if (this.cinema.id !== null) {
      this.service.getCinema(this.cinema.id).subscribe({
        next: (response) => {
          this.cinema = response.data;
          this.errorMessage = null;
          if (this.editMode) {
            this.loadShowtime();
          }
        },
        error: () => {
          this.errorMessage = 'An error occurred while fetching cinema.';
          console.error('Error getting cinema:');
          this.router.navigate(["/manager-home/showtimes"]);
        }
      });
    }
  }

  loadShowtime() {
    if (this.showtimeId) {
      this.service.getShowtime(this.showtimeId,"yes").subscribe({
        next: (response) => {
          this.showtime = response.data;
          this.errorMessage = null;
          if (!this.validate()) {
            this.errorMessage = "Url with incorrect data";
            console.log(this.errorMessage);
            this.router.navigate(["/manager-home/showtimes"]);
          }
          console.log(this.showtime);
          this.formats = this.showtime.movie.formats;
          this.languages = this.showtime.movie.languages;
          this.showtimeForm.setValue({
            startDate: this.formatToDateTimeLocal(this.showtime.dayAndTime),
            finishDate: this.formatToDateTimeLocal(this.showtime.finishTime),
            selectMovieId: this.showtime.movie.id,
            selectFormatId: this.showtime.format.id,
            selectLanguageId: this.showtime.language.id,
            selectTheaterId: this.showtime.theater.id
          });
        },
        error: () => {
          this.errorMessage = 'An error occurred while fetching the showtime.';
          console.error('Error getting showtime:');
        }
      });
    }
  }

  validate() {
    return this.cinema.theaters.some(t => t.id == this.showtime?.theater.id);
  }

  deleteShowtime(){
    if(this.showtimeId){
      this.service.deleteShowtime(this.showtimeId).subscribe({
        next: ()=>{
          this.errorMessage = null;
          this.router.navigate(["/manager-home/showtimes/", this.cinema.id]);
        }, error: ()=> {
          this.errorMessage = 'An error occurred while deleting the showtime.'
          console.error('Error deleting showtime:');
        }
      });
    }
  }

  submit(){
    this.showtime.dayAndTime = this.showtimeForm.get("startDate")?.value;
    this.showtime.finishTime = this.showtimeForm.get("finishDate")?.value;
    this.showtime.format = this.showtimeForm.get("selectFormatId")?.value;
    this.showtime.language = this.showtimeForm.get("selectLanguageId")?.value;
    this.showtime.movie = this.showtimeForm.get("selectMovieId")?.value;
    this.showtime.theater = this.showtimeForm.get("selectTheaterId")?.value;
    console.log("en el submit este es el showtime que se envia: ",this.showtime)
    if(this.editMode){
      if(this.showtimeId != null){
        this.service.updateShowtime(this.showtimeId, this.showtime).subscribe({
          next: () => {
              this.errorMessage = null;
              this.router.navigate(['/manager-home/showtimes/',this.cinema.id]);
          },
          error: () => {
            this.errorMessage = 'An error occurred while updating the showtime.'
            console.error('Error updating showtime:');
          }
        });
      }
    }else{

      //logica del add showtime

        /*this.theater.cinema = this.cinema.id;
        this.service.addTheater(this.theater).subscribe({
          next: () => {
              this.errorMessage = null;
              this.router.navigate(['/manager-home/theaters/',this.cinema.id]);
          },
          error: () => {
            this.errorMessage = 'An error occurred while creating the theater.'
            console.error('Error creating theater:');
          }
        });*/
      }
  }

  checkDates: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const start = group.get('startDate')?.value;
    const end = group.get('finishDate')?.value;

    if (!start || !end) {
      return null; // No validar si no hay datos
    }
      const startDate = new Date(start);
    const endDate = new Date(end);

    return startDate && endDate && startDate < endDate ? null : { invalidDates: true };
  }

  formatToDateTimeLocal(date2: Date): string {
    const date = new Date (date2)
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onMovieChange(){
    this.selectedMovieId = this.showtimeForm.get("selectMovieId")?.value;
    if(this.showtime != null){
      this.showtimeForm.setValue({
        startDate: this.formatToDateTimeLocal(this.showtime.dayAndTime),
        finishDate: this.formatToDateTimeLocal(this.showtime.finishTime),
        selectMovieId: this.selectedMovieId,
        selectTheaterId: this.showtimeForm.get("selectTheaterId")?.value,
        selectFormatId: null,
        selectLanguageId: null,
      });
    }    
    
    if(this.selectedMovieId !== null){
      this.service.getMovieData(this.selectedMovieId).subscribe({
        next: (response) => {
          this.formats = response.data.formats;
          this.languages = response.data.languages;
        }, error: ()=>{
          this.errorMessage = 'An error occurred while searching the movie.'
          console.error('Error searching movie:');
        }
      })
    }else{
      this.languages = []
      this.formats = []
    }      

  }

}
