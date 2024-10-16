import { HttpBackend, HttpClient } from '@angular/common/http'
import { TranslateLoader } from '@ngx-translate/core'
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
    private _resourcesPrefix: string[] | TranslationResource[],
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

    return forkJoin(requests).pipe(
      map((response) => response.reduce((acc, curr) => this.mergeDeep(acc, curr), {})),
    )
  }

  // @ToDo: Use it from ngx-translate once it gets exported: https://github.com/rbalet/ngx-translate-multi-http-loader/issues/35
  isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item)
  }

  mergeDeep(target: any, source: any): any {
    const output = Object.assign({}, target)

    if (!this.isObject(target)) {
      return this.mergeDeep({}, source)
    }

    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach((key: any) => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] })
          } else {
            output[key] = this.mergeDeep(target[key], source[key])
          }
        } else {
          Object.assign(output, { [key]: source[key] })
        }
      })
    }
    return output
  }
}
