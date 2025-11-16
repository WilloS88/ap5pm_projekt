import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

export interface TmdbMovie {
	id: number;
	title: string;
	overview: string;
	poster_path: string | null;
	release_date: string;
	vote_average: number;
}

export interface Paged<T> {
	page: number;
	results: T[];
	total_pages: number;
	total_results: number;
}

export interface TmdbMovieDetail extends TmdbMovie {
	runtime: number;
	genres: { id: number; name: string }[];
	credits: {
		cast: {
			id: number;
			name: string;
			character: string;
			profile_path: string | null;
		}[];
		crew: {
			id: number;
			name: string;
			job: string;
		}[];
	};
}

@Injectable({ providedIn: "root" })
export class TmdbService {
	private api = environment.tmdb.baseUrl;
	private key = environment.tmdb.apiKey;

	constructor(private http: HttpClient) {}

	getCatalog(page = 1): Observable<Paged<TmdbMovie>> {
		const params = new HttpParams()
			.set("api_key", this.key)
			.set("sort_by", "popularity.desc")
			.set("page", page.toString())
			.set("include_adult", "false");

		return this.http.get<Paged<TmdbMovie>>(`${this.api}/discover/movie`, { params });
	}

	getRandomCatalog(): Observable<Paged<TmdbMovie>> {
		const randomPage = Math.floor(Math.random() * 50) + 1;
		return this.getCatalog(randomPage);
	}

	img(path: string | null, size: "w185" | "w342" | "w500" = "w342") {
		return path ? `https://image.tmdb.org/t/p/${size}${path}` : "assets/placeholder-poster.png";
	}

	getMovieDetail(id: number): Observable<TmdbMovieDetail> {
		const params = new HttpParams().set("api_key", this.key).set("append_to_response", "credits");
		return this.http.get<TmdbMovieDetail>(`${this.api}/movie/${id}`, { params });
	}

	searchMovies(query: string, page = 1): Observable<Paged<TmdbMovie>> {
		const params = new HttpParams()
			.set("api_key", this.key)
			.set("query", query)
			.set("page", page.toString())
			.set("include_adult", "false");

		return this.http.get<Paged<TmdbMovie>>(`${this.api}/search/movie`, { params });
	}

	searchPerson(query: string): Observable<any> {
		const params = new HttpParams().set("api_key", this.key).set("query", query).set("include_adult", "false");

		return this.http.get<any>(`${this.api}/search/person`, { params });
	}

	getPersonMovies(personId: number): Observable<any> {
		const params = new HttpParams().set("api_key", this.key);

		return this.http.get<any>(`${this.api}/person/${personId}/movie_credits`, { params });
	}
}
