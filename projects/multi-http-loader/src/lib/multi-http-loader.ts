import { HttpBackend, HttpClient } from '@angular/common/http'
import { TranslateLoader } from '@ngx-translate/core'
import { deepmerge } from 'deepmerge-ts'
import { forkJoin, Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

export interface ITranslationResource {
  prefix: string
  suffix?: string
  optional?: boolean
}

export class MultiTranslateHttpLoader implements TranslateLoader {
  constructor(
    private _handler: HttpBackend,
    private _resourcesPrefix: string[] | ITranslationResource[],
  ) {}

  public getTranslation(lang: string): Observable<any> {
    const requests: Observable<Object | {}>[] = this._resourcesPrefix.map((resource) => {
      let path: string

      if (typeof resource === 'string') path = `${resource}${lang}.json`
      else path = `${resource.prefix}${lang}${resource.suffix || '.json'}`

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

    return forkJoin(requests).pipe(map((response) => deepmerge(...response)))
  }
}
