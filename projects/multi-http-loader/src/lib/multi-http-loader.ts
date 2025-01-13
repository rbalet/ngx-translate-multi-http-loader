import { HttpBackend, HttpClient } from '@angular/common/http'
import { mergeDeep, TranslateLoader } from '@ngx-translate/core'
import { forkJoin, Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

export interface TranslationResource {
  prefix: string
  suffix?: string
  optional?: boolean
}

export class MultiTranslateHttpLoader implements TranslateLoader {
  constructor(
    private _handler: HttpBackend,
    private _resourcesPrefix: (string | TranslationResource)[],
  ) {}

  public getTranslation(lang: string): Observable<any> {
    const requests: Observable<Object | {}>[] = this._resourcesPrefix.map((resource) => {
      let path: string

      if (typeof resource === 'string') path = `${resource}${lang}.json`
      else path = `${resource.prefix}${lang}${resource.suffix ?? '.json'}`

      return new HttpClient(this._handler).get(path).pipe(
        catchError((res) => {
          if (typeof resource !== 'string' && !resource.optional) {
            console.group()
            console.error('Something went wrong for the following translation file:', path)
            console.error(res)
            console.groupEnd()
          }
          return of({})
        }),
      )
    })

    return forkJoin(requests).pipe(
      map((response) => response.reduce((acc, curr) => mergeDeep(acc, curr), {})),
    )
  }
}
