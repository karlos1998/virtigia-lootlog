/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ErrorResponse {
  message?: string
}

/** Allocation of loot - who got what item */
export interface AssignedItem {
  /** Loot id in loot window. It's just the id in the window for assigning a specific item. */
  lootItemId?: string
  /**
   * Base id of the item that can be found in the map editor
   * @format int64
   */
  baseItemId?: number
  /** Item name */
  baseItemName?: string
  /**
   * Id of items created in the bag. This is a list because when we get a consumable item, it can connect us with another existing item in the bag and add a second one if there is a maximum number of uses.
   * @uniqueItems true
   */
  itemIds?: string[]
  /** Id of the hero who got the item */
  characterId?: string
  /** Character name */
  characterName?: string
}

export interface BaseItemDTO {
  /** @format int64 */
  id?: number
  name?: string
  src?: string
  attributes?: ItemAttributes
  category?:
    | 'oneHanded'
    | 'armors'
    | 'twoHanded'
    | 'halfHanded'
    | 'gloves'
    | 'helmets'
    | 'boots'
    | 'rings'
    | 'necklaces'
    | 'shields'
    | 'staffs'
    | 'auxiliary'
    | 'quests'
    | 'consumable'
    | 'neutrals'
    | 'backpacks'
    | 'wands'
    | 'distances'
    | 'arrows'
    | 'talismans'
    | 'upgrades'
    | 'books'
    | 'keys'
    | 'golds'
  currency?: 'gold' | 'unset'
  /** @format int32 */
  price?: number
  rarity?: 'common' | 'unique' | 'heroic' | 'legendary' | 'upgraded' | 'artefact'
}

/** List of characters who got the loot window */
export interface CharacterLiteDTO {
  id: string
  name: string
  src: string
  /** @format int32 */
  lvl?: number
  profession: 'p' | 'w' | 't' | 'h' | 'm' | 'b'
}

export interface ItemAttributes {
  attributes?: Record<string, object>
}

/** List of items in the loot window */
export interface LootItemDTO {
  id?: string
  item?: BaseItemDTO
  wantCharacterIds?: string[]
  dontCharacterIds?: string[]
  needCharacterIds?: string[]
}

export interface LootlogBattleRecordDTO {
  id: string
  /** @format date-time */
  createdAt: string
  characters: LootlogCharacterLiteDTO[]
  npcs: NpcDTO[]
  attackerId: string
  attackerType: string
  lootsAllocation?: LootsAllocationDTO
}

export interface LootlogCharacterLiteDTO {
  id: string
  name: string
  src: string
  /** @format int32 */
  lvl?: number
  profession: 'p' | 'w' | 't' | 'h' | 'm' | 'b'
}

export type LootsAllocationDTO = {
  /** List of characters who got the loot window */
  characters?: CharacterLiteDTO[]
  /** List of items in the loot window */
  items?: LootItemDTO[]
  /** Id of characters who confirmed the loot window before the time expired */
  confirmedCharacterIds?: string[]
  /** Allocation of loot - who got what item */
  assignedItems?: AssignedItem[]
} | null

export interface NpcDTO {
  /** @format int64 */
  id: number
  /** @format int64 */
  mapId: number
  name: string
  src: string
  /** @format int32 */
  x: number
  /** @format int32 */
  y: number
  /** @format int32 */
  lvl: number
  rank: 'NORMAL' | 'ELITE' | 'ELITE_II' | 'ELITE_III' | 'HERO' | 'TITAN'
  profession: 'p' | 'w' | 't' | 'h' | 'm' | 'b'
  inGroup: boolean
}

export interface PageLootlogBattleRecordDTO {
  /** @format int32 */
  totalPages?: number
  /** @format int64 */
  totalElements?: number
  first?: boolean
  last?: boolean
  /** @format int32 */
  size?: number
  content?: LootlogBattleRecordDTO[]
  /** @format int32 */
  number?: number
  sort?: SortObject
  pageable?: PageableObject
  /** @format int32 */
  numberOfElements?: number
  empty?: boolean
}

export interface PageableObject {
  /** @format int64 */
  offset?: number
  sort?: SortObject
  unpaged?: boolean
  paged?: boolean
  /** @format int32 */
  pageNumber?: number
  /** @format int32 */
  pageSize?: number
}

export interface SortObject {
  empty?: boolean
  unsorted?: boolean
  sorted?: boolean
}

import type { AxiosInstance, AxiosRequestConfig, HeadersDefaults, ResponseType } from 'axios'
import axios from 'axios'

export type QueryParamsType = Record<string | number, any>

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, 'data' | 'params' | 'url' | 'responseType'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean
  /** request path */
  path: string
  /** content type of request body */
  type?: ContentType
  /** query params */
  query?: QueryParamsType
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType
  /** request body */
  body?: unknown
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, 'data' | 'cancelToken'> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void
  secure?: boolean
  format?: ResponseType
}

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance
  private securityData: SecurityDataType | null = null
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker']
  private secure?: boolean
  private format?: ResponseType

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || 'https://mbp-karol-java.letscode.it',
    })
    this.secure = secure
    this.format = format
    this.securityWorker = securityWorker
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data
  }

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method)

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    }
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === 'object' && formItem !== null) {
      return JSON.stringify(formItem)
    } else {
      return `${formItem}`
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key]
      const propertyContent: any[] = property instanceof Array ? property : [property]

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem))
      }

      return formData
    }, new FormData())
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<T> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {}
    const requestParams = this.mergeRequestParams(params, secureParams)
    const responseFormat = format || this.format || undefined

    if (type === ContentType.FormData && body && body !== null && typeof body === 'object') {
      body = this.createFormData(body as Record<string, unknown>)
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== 'string') {
      body = JSON.stringify(body)
    }

    return this.instance
      .request({
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type ? { 'Content-Type': type } : {}),
        },
        params: query,
        responseType: responseFormat,
        data: body,
        url: path,
      })
      .then((response) => response.data)
  }
}

/**
 * @title Admin API
 * @version v1
 * @baseUrl https://mbp-karol-java.letscode.it
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  lootlog = {
    /**
     * @description List of fights with participants, distribution of loots etc.
     *
     * @tags Battle records
     * @name GetAll
     * @summary List of battles
     * @request GET:/lootlog/api/battle-records
     */
    getAll: (
      query?: {
        npcName?: string
        characterName?: string
        /** @format int32 */
        minNpcLvl?: number
        /** @format int32 */
        maxNpcLvl?: number
        /** @format int32 */
        minCharacterLvl?: number
        /** @format int32 */
        maxCharacterLvl?: number
        /**
         * Zero-based page index (0..N)
         * @min 0
         * @default 0
         */
        page?: number
        /**
         * The size of the page to be returned
         * @min 1
         * @default 100
         */
        size?: number
        /** Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. */
        sort?: string[]
      },
      params: RequestParams = {},
    ) =>
      this.request<PageLootlogBattleRecordDTO, ErrorResponse>({
        path: `/lootlog/api/battle-records`,
        method: 'GET',
        query: query,
        ...params,
      }),
  }
}
