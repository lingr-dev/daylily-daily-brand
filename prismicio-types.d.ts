import type * as prismic from "@prismicio/client";

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };


type PickContentRelationshipFieldData<
	TRelationship extends prismic.CustomTypeModelFetchCustomTypeLevel1 | prismic.CustomTypeModelFetchCustomTypeLevel2 | prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2,
	TData extends Record<string, prismic.AnyRegularField | prismic.GroupField | prismic.NestedGroupField | prismic.SliceZone>,
	TLang extends string
> = |
	// Content relationship fields
	{
		[TSubRelationship in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchContentRelationshipLevel1
		> as TSubRelationship["id"]]:
			ContentRelationshipFieldWithData<TSubRelationship["customtypes"], TLang>;
	} &
	// Group
	{
		[TGroup in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2
		> as TGroup["id"]]:
			TData[TGroup["id"]] extends prismic.GroupField<infer TGroupData>
				? prismic.GroupField<PickContentRelationshipFieldData<TGroup, TGroupData, TLang>>
				: never
	} &
	// Other fields
	{
		[TFieldKey in Extract<TRelationship["fields"][number], string>]:
			TFieldKey extends keyof TData ? TData[TFieldKey] : never;
	};

type ContentRelationshipFieldWithData<
	TCustomType extends readonly (prismic.CustomTypeModelFetchCustomTypeLevel1 | string)[] | readonly (prismic.CustomTypeModelFetchCustomTypeLevel2 | string)[],
	TLang extends string = string
> = {
	[ID in Exclude<TCustomType[number], string>["id"]]:
		prismic.ContentRelationshipField<
			ID,
			TLang,
			PickContentRelationshipFieldData<
				Extract<TCustomType[number], { id: ID }>,
				Extract<prismic.Content.AllDocumentTypes, { type: ID }>["data"],
				TLang
			>
		>
}[Exclude<TCustomType[number], string>["id"]];

type HomepageDocumentDataSlicesSlice = HeroSlice | RichTextSlice | FeatureGridSlice | StatsSlice | LogoWallSlice | ImageTextSlice | TestimonialSlice | CtaBannerSlice | FaqSlice | MediaCardsSlice | CalloutSlice

/**
 * Content for Homepage documents
 */
interface HomepageDocumentData {
	/**
	 * Slice Zone field in *Homepage*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: homepage.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<HomepageDocumentDataSlicesSlice>;/**
	 * Meta Title field in *Homepage*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A title of the page used for social media and search engines
	 * - **API ID Path**: homepage.meta_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * Meta Description field in *Homepage*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A brief summary of the page
	 * - **API ID Path**: homepage.meta_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * Meta Image field in *Homepage*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: homepage.meta_image
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	meta_image: prismic.ImageField<never>;
}

/**
 * Homepage document from Prismic
 *
 * - **API ID**: `homepage`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type HomepageDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<HomepageDocumentData>, "homepage", Lang>;

type NewsIndexDocumentDataSlicesSlice = HeroSlice | RichTextSlice | CtaBannerSlice

/**
 * Content for News Index documents
 */
interface NewsIndexDocumentData {
	/**
	 * Slice Zone field in *News Index*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: news_index.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<NewsIndexDocumentDataSlicesSlice>;/**
	 * Meta Title field in *News Index*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A title of the page used for social media and search engines
	 * - **API ID Path**: news_index.meta_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * Meta Description field in *News Index*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A brief summary of the page
	 * - **API ID Path**: news_index.meta_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * Meta Image field in *News Index*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: news_index.meta_image
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	meta_image: prismic.ImageField<never>;
}

/**
 * News Index document from Prismic
 *
 * - **API ID**: `news_index`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type NewsIndexDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<NewsIndexDocumentData>, "news_index", Lang>;

type NewsPostDocumentDataSlicesSlice = RichTextSlice | ImageTextSlice | CtaBannerSlice | FaqSlice

/**
 * Content for News Post documents
 */
interface NewsPostDocumentData {
	/**
	 * 标题 field in *News Post*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: news_post.title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * 摘要 field in *News Post*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: 列表页与分享卡片上显示的一句话
	 * - **API ID Path**: news_post.excerpt
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	excerpt: prismic.KeyTextField;
	
	/**
	 * 封面图 field in *News Post*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: news_post.cover
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	cover: prismic.ImageField<never>;
	
	/**
	 * 发布日期 field in *News Post*
	 *
	 * - **Field Type**: Date
	 * - **Placeholder**: *None*
	 * - **API ID Path**: news_post.published_at
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/date
	 */
	published_at: prismic.DateField;
	
	/**
	 * Slice Zone field in *News Post*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: news_post.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<NewsPostDocumentDataSlicesSlice>;/**
	 * Meta Title field in *News Post*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A title of the page used for social media and search engines
	 * - **API ID Path**: news_post.meta_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * Meta Description field in *News Post*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A brief summary of the page
	 * - **API ID Path**: news_post.meta_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * Meta Image field in *News Post*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: news_post.meta_image
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	meta_image: prismic.ImageField<never>;
}

/**
 * News Post document from Prismic
 *
 * - **API ID**: `news_post`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type NewsPostDocument<Lang extends string = string> = prismic.PrismicDocumentWithUID<Simplify<NewsPostDocumentData>, "news_post", Lang>;

type PageDocumentDataSlicesSlice = HeroSlice | RichTextSlice | FeatureGridSlice | StatsSlice | LogoWallSlice | ImageTextSlice | TestimonialSlice | CtaBannerSlice | FaqSlice | MediaCardsSlice | CalloutSlice

/**
 * Content for Page documents
 */
interface PageDocumentData {
	/**
	 * Slice Zone field in *Page*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<PageDocumentDataSlicesSlice>;/**
	 * Meta Title field in *Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A title of the page used for social media and search engines
	 * - **API ID Path**: page.meta_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * Meta Description field in *Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A brief summary of the page
	 * - **API ID Path**: page.meta_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * Meta Image field in *Page*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page.meta_image
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	meta_image: prismic.ImageField<never>;
}

/**
 * Page document from Prismic
 *
 * - **API ID**: `page`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type PageDocument<Lang extends string = string> = prismic.PrismicDocumentWithUID<Simplify<PageDocumentData>, "page", Lang>;

type ReleaseIndexDocumentDataSlicesSlice = HeroSlice | RichTextSlice | CtaBannerSlice

/**
 * Content for Release Index documents
 */
interface ReleaseIndexDocumentData {
	/**
	 * Slice Zone field in *Release Index*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: release_index.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<ReleaseIndexDocumentDataSlicesSlice>;/**
	 * Meta Title field in *Release Index*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A title of the page used for social media and search engines
	 * - **API ID Path**: release_index.meta_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * Meta Description field in *Release Index*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A brief summary of the page
	 * - **API ID Path**: release_index.meta_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * Meta Image field in *Release Index*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: release_index.meta_image
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	meta_image: prismic.ImageField<never>;
}

/**
 * Release Index document from Prismic
 *
 * - **API ID**: `release_index`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type ReleaseIndexDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<ReleaseIndexDocumentData>, "release_index", Lang>;

/**
 * Item in *Release Note → 变更条目*
 */
export interface ReleaseNoteDocumentDataChangesItem {
	/**
	 * 类型 field in *Release Note → 变更条目*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: feature
	 * - **API ID Path**: release_note.changes[].kind
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	kind: prismic.SelectField<"feature" | "improvement" | "fix", "filled">;
	
	/**
	 * 说明 field in *Release Note → 变更条目*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: 一句话说清这条变更
	 * - **API ID Path**: release_note.changes[].description
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	description: prismic.KeyTextField;
}

/**
 * Content for Release Note documents
 */
interface ReleaseNoteDocumentData {
	/**
	 * 版本号 field in *Release Note*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: v2.4.0
	 * - **API ID Path**: release_note.version
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	version: prismic.KeyTextField;
	
	/**
	 * 发布日期 field in *Release Note*
	 *
	 * - **Field Type**: Date
	 * - **Placeholder**: *None*
	 * - **API ID Path**: release_note.released_at
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/date
	 */
	released_at: prismic.DateField;
	
	/**
	 * 一句话概述 field in *Release Note*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: 这一版最值得说的一件事
	 * - **API ID Path**: release_note.title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
	
	/**
	 * 补充说明 field in *Release Note*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: release_note.summary
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	summary: prismic.RichTextField;
	
	/**
	 * 里程碑版本 field in *Release Note*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **API ID Path**: release_note.is_major
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	is_major: prismic.BooleanField;
	
	/**
	 * 延伸链接 field in *Release Note*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: release_note.link
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * 变更条目 field in *Release Note*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: release_note.changes[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	changes: prismic.GroupField<Simplify<ReleaseNoteDocumentDataChangesItem>>;
}

/**
 * Release Note document from Prismic
 *
 * - **API ID**: `release_note`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type ReleaseNoteDocument<Lang extends string = string> = prismic.PrismicDocumentWithUID<Simplify<ReleaseNoteDocumentData>, "release_note", Lang>;

/**
 * Item in *Settings → 社交账号*
 */
export interface SettingsDocumentDataSocialLinksItem {
	/**
	 * 平台 field in *Settings → 社交账号*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.social_links[].platform
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	platform: prismic.SelectField<"wechat" | "weibo" | "linkedin" | "github" | "youtube" | "x">;
	
	/**
	 * 链接 field in *Settings → 社交账号*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.social_links[].link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Content for Settings documents
 */
interface SettingsDocumentData {
	/**
	 * 站点名称 field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.site_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	site_name: prismic.KeyTextField;
	
	/**
	 * 一句话定位 field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.site_tagline
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	site_tagline: prismic.KeyTextField;
	
	/**
	 * Logo field in *Settings*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.logo
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	logo: prismic.ImageField<never>;
	
	/**
	 * 主导航 field in *Settings*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.primary_nav
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	primary_nav: prismic.Repeatable<prismic.LinkField<string, string, unknown, prismic.FieldState, never>>;
	
	/**
	 * 页脚导航 field in *Settings*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.footer_nav
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	footer_nav: prismic.Repeatable<prismic.LinkField<string, string, unknown, prismic.FieldState, never>>;
	
	/**
	 * 页脚说明 field in *Settings*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.footer_note
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	footer_note: prismic.RichTextField;
	
	/**
	 * ICP 备案号 field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: 京ICP备00000000号-1
	 * - **API ID Path**: settings.icp_license
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	icp_license: prismic.KeyTextField;
	
	/**
	 * 小程序备案号 field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: 京ICP备00000000号-2X
	 * - **API ID Path**: settings.miniprogram_icp_license
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	miniprogram_icp_license: prismic.KeyTextField;
	
	/**
	 * 公安备案号 field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: 京公网安备00000000000000号
	 * - **API ID Path**: settings.police_license
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	police_license: prismic.KeyTextField;
	
	/**
	 * 公安备案查询链接 field in *Settings*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.police_license_link
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	police_license_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * 联系邮箱 field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.contact_email
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	contact_email: prismic.KeyTextField;
	
	/**
	 * 联系电话 field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.contact_phone
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	contact_phone: prismic.KeyTextField;
	
	/**
	 * 办公地址 field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.contact_address
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	contact_address: prismic.KeyTextField;
	
	/**
	 * 社交账号 field in *Settings*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.social_links[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	social_links: prismic.GroupField<Simplify<SettingsDocumentDataSocialLinksItem>>;
	
	/**
	 * 百度统计 ID field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: hm.js?<ID> 里的那串 ID
	 * - **API ID Path**: settings.baidu_analytics_id
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	baidu_analytics_id: prismic.KeyTextField;/**
	 * 小程序按钮文案 field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: 打开小程序
	 * - **API ID Path**: settings.miniprogram_cta_label
	 * - **Tab**: 小程序
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	miniprogram_cta_label: prismic.KeyTextField;
	
	/**
	 * 小程序二维码 field in *Settings*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.miniprogram_qrcode
	 * - **Tab**: 小程序
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	miniprogram_qrcode: prismic.ImageField<never>;
	
	/**
	 * 扫码区标题 field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: 微信扫码打开
	 * - **API ID Path**: settings.miniprogram_qr_title
	 * - **Tab**: 小程序
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	miniprogram_qr_title: prismic.KeyTextField;
	
	/**
	 * 扫码区说明 field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: 使用微信扫描下方二维码，即可打开小程序。
	 * - **API ID Path**: settings.miniprogram_qr_description
	 * - **Tab**: 小程序
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	miniprogram_qr_description: prismic.KeyTextField;
	
	/**
	 * 扫码区脚注 field in *Settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: 已上线，扫码即可在微信中使用
	 * - **API ID Path**: settings.miniprogram_qr_note
	 * - **Tab**: 小程序
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	miniprogram_qr_note: prismic.KeyTextField;
}

/**
 * Settings document from Prismic
 *
 * - **API ID**: `settings`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type SettingsDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<SettingsDocumentData>, "settings", Lang>;

export type AllDocumentTypes = HomepageDocument | NewsIndexDocument | NewsPostDocument | PageDocument | ReleaseIndexDocument | ReleaseNoteDocument | SettingsDocument;

/**
 * Primary content in *Callout → Default → Primary*
 */
export interface CalloutSliceDefaultPrimary {
	/**
	 * 图标 field in *Callout → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **API ID Path**: callout.default.primary.icon
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	icon: prismic.SelectField<"translate-2" | "time-line" | "battery-low-line" | "eye-line" | "lock-2-line" | "sun-cloudy-line" | "parent-line" | "question-answer-line" | "wechat-line">;
	
	/**
	 * 标题 field in *Callout → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: callout.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
	
	/**
	 * 正文 field in *Callout → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: callout.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
}

/**
 * Default variation for Callout Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type CalloutSliceDefault = prismic.SharedSliceVariation<"default", Simplify<CalloutSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Callout*
 */
type CalloutSliceVariation = CalloutSliceDefault

/**
 * Callout Shared Slice
 *
 * - **API ID**: `callout`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type CalloutSlice = prismic.SharedSlice<"callout", CalloutSliceVariation>;

/**
 * Primary content in *Cta Banner → Default → Primary*
 */
export interface CtaBannerSliceDefaultPrimary {
	/**
	 * 标题 field in *Cta Banner → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: cta_banner.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * 副文案 field in *Cta Banner → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: cta_banner.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * 主按钮 field in *Cta Banner → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: cta_banner.default.primary.primary_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	primary_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * 次按钮 field in *Cta Banner → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: cta_banner.default.primary.secondary_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	secondary_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Default variation for Cta Banner Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type CtaBannerSliceDefault = prismic.SharedSliceVariation<"default", Simplify<CtaBannerSliceDefaultPrimary>, never>;

/**
 * Primary content in *Cta Banner → Light → Primary*
 */
export interface CtaBannerSliceLightPrimary {
	/**
	 * 标题 field in *Cta Banner → Light → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: cta_banner.light.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * 副文案 field in *Cta Banner → Light → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: cta_banner.light.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * 主按钮 field in *Cta Banner → Light → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: cta_banner.light.primary.primary_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	primary_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * 次按钮 field in *Cta Banner → Light → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: cta_banner.light.primary.secondary_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	secondary_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * 展示小程序二维码 field in *Cta Banner → Light → Primary*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: true
	 * - **API ID Path**: cta_banner.light.primary.show_qrcode
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	show_qrcode: prismic.BooleanField;
	
	/**
	 * 锚点 ID field in *Cta Banner → Light → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: 如 cta，导航栏按钮靠它定位
	 * - **API ID Path**: cta_banner.light.primary.anchor_id
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	anchor_id: prismic.KeyTextField;
}

/**
 * Light variation for Cta Banner Slice
 *
 * - **API ID**: `light`
 * - **Description**: Light
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type CtaBannerSliceLight = prismic.SharedSliceVariation<"light", Simplify<CtaBannerSliceLightPrimary>, never>;

/**
 * Slice variation for *Cta Banner*
 */
type CtaBannerSliceVariation = CtaBannerSliceDefault | CtaBannerSliceLight

/**
 * Cta Banner Shared Slice
 *
 * - **API ID**: `cta_banner`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type CtaBannerSlice = prismic.SharedSlice<"cta_banner", CtaBannerSliceVariation>;

/**
 * Item in *Faq → Default → Primary → 问答*
 */
export interface FaqSliceDefaultPrimaryItemsItem {
	/**
	 * 问题 field in *Faq → Default → Primary → 问答*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: faq.default.primary.items[].question
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	question: prismic.KeyTextField;
	
	/**
	 * 回答 field in *Faq → Default → Primary → 问答*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: faq.default.primary.items[].answer
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	answer: prismic.RichTextField;
}

/**
 * Primary content in *Faq → Default → Primary*
 */
export interface FaqSliceDefaultPrimary {
	/**
	 * 标题 field in *Faq → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: faq.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * 问答 field in *Faq → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: faq.default.primary.items[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	items: prismic.GroupField<Simplify<FaqSliceDefaultPrimaryItemsItem>>;
}

/**
 * Default variation for Faq Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FaqSliceDefault = prismic.SharedSliceVariation<"default", Simplify<FaqSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Faq*
 */
type FaqSliceVariation = FaqSliceDefault

/**
 * Faq Shared Slice
 *
 * - **API ID**: `faq`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FaqSlice = prismic.SharedSlice<"faq", FaqSliceVariation>;

/**
 * Item in *Feature Grid → Default → Primary → 条目*
 */
export interface FeatureGridSliceDefaultPrimaryItemsItem {
	/**
	 * 图标 field in *Feature Grid → Default → Primary → 条目*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature_grid.default.primary.items[].icon
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	icon: prismic.ImageField<never>;
	
	/**
	 * 标题 field in *Feature Grid → Default → Primary → 条目*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature_grid.default.primary.items[].title
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
	
	/**
	 * 描述 field in *Feature Grid → Default → Primary → 条目*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature_grid.default.primary.items[].description
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	description: prismic.RichTextField;
}

/**
 * Item in *Feature Grid → Card → Primary → 条目*
 */
export interface FeatureGridSliceCardPrimaryItemsItem {
	/**
	 * 图标 field in *Feature Grid → Card → Primary → 条目*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature_grid.card.primary.items[].icon
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	icon: prismic.SelectField<"translate-2" | "time-line" | "battery-low-line" | "eye-line" | "lock-2-line" | "sun-cloudy-line" | "parent-line" | "question-answer-line" | "wechat-line">;
	
	/**
	 * 标题 field in *Feature Grid → Card → Primary → 条目*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature_grid.card.primary.items[].title
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
	
	/**
	 * 描述 field in *Feature Grid → Card → Primary → 条目*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature_grid.card.primary.items[].description
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	description: prismic.RichTextField;
}

/**
 * Item in *Feature Grid → Quote → Primary → 条目*
 */
export interface FeatureGridSliceQuotePrimaryItemsItem {
	/**
	 * 图标 field in *Feature Grid → Quote → Primary → 条目*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature_grid.quote.primary.items[].icon
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	icon: prismic.SelectField<"translate-2" | "time-line" | "battery-low-line" | "eye-line" | "lock-2-line" | "sun-cloudy-line" | "parent-line" | "question-answer-line" | "wechat-line">;
	
	/**
	 * 标题 field in *Feature Grid → Quote → Primary → 条目*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature_grid.quote.primary.items[].title
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
	
	/**
	 * 引述 field in *Feature Grid → Quote → Primary → 条目*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: 产品里的一句原话
	 * - **API ID Path**: feature_grid.quote.primary.items[].quote
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	quote: prismic.KeyTextField;
	
	/**
	 * 说明 field in *Feature Grid → Quote → Primary → 条目*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature_grid.quote.primary.items[].description
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	description: prismic.RichTextField;
}

/**
 * Primary content in *Feature Grid → Default → Primary*
 */
export interface FeatureGridSliceDefaultPrimary {
	/**
	 * 标题 field in *Feature Grid → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature_grid.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * 引言 field in *Feature Grid → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature_grid.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * 每行列数 field in *Feature Grid → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: 3
	 * - **API ID Path**: feature_grid.default.primary.columns
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	columns: prismic.SelectField<"2" | "3" | "4", "filled">;
	
	/**
	 * 条目 field in *Feature Grid → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature_grid.default.primary.items[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	items: prismic.GroupField<Simplify<FeatureGridSliceDefaultPrimaryItemsItem>>;
}

/**
 * Default variation for Feature Grid Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FeatureGridSliceDefault = prismic.SharedSliceVariation<"default", Simplify<FeatureGridSliceDefaultPrimary>, never>;

/**
 * Primary content in *Feature Grid → Card → Primary*
 */
export interface FeatureGridSliceCardPrimary {
	/**
	 * 标题 field in *Feature Grid → Card → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature_grid.card.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * 引言 field in *Feature Grid → Card → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature_grid.card.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * 每行列数 field in *Feature Grid → Card → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: 2
	 * - **API ID Path**: feature_grid.card.primary.columns
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	columns: prismic.SelectField<"2" | "3" | "4", "filled">;
	
	/**
	 * 锚点 ID field in *Feature Grid → Card → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: 如 philosophy，留空则不生成锚点
	 * - **API ID Path**: feature_grid.card.primary.anchor_id
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	anchor_id: prismic.KeyTextField;
	
	/**
	 * 条目 field in *Feature Grid → Card → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature_grid.card.primary.items[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	items: prismic.GroupField<Simplify<FeatureGridSliceCardPrimaryItemsItem>>;
}

/**
 * Card variation for Feature Grid Slice
 *
 * - **API ID**: `card`
 * - **Description**: Card
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FeatureGridSliceCard = prismic.SharedSliceVariation<"card", Simplify<FeatureGridSliceCardPrimary>, never>;

/**
 * Primary content in *Feature Grid → Quote → Primary*
 */
export interface FeatureGridSliceQuotePrimary {
	/**
	 * 标题 field in *Feature Grid → Quote → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature_grid.quote.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * 锚点 ID field in *Feature Grid → Quote → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: 如 details，留空则不生成锚点
	 * - **API ID Path**: feature_grid.quote.primary.anchor_id
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	anchor_id: prismic.KeyTextField;
	
	/**
	 * 条目 field in *Feature Grid → Quote → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: feature_grid.quote.primary.items[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	items: prismic.GroupField<Simplify<FeatureGridSliceQuotePrimaryItemsItem>>;
}

/**
 * Quote variation for Feature Grid Slice
 *
 * - **API ID**: `quote`
 * - **Description**: Quote
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FeatureGridSliceQuote = prismic.SharedSliceVariation<"quote", Simplify<FeatureGridSliceQuotePrimary>, never>;

/**
 * Slice variation for *Feature Grid*
 */
type FeatureGridSliceVariation = FeatureGridSliceDefault | FeatureGridSliceCard | FeatureGridSliceQuote

/**
 * Feature Grid Shared Slice
 *
 * - **API ID**: `feature_grid`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FeatureGridSlice = prismic.SharedSlice<"feature_grid", FeatureGridSliceVariation>;

/**
 * Primary content in *Hero → Default → Primary*
 */
export interface HeroSliceDefaultPrimary {
	/**
	 * 眉标 field in *Hero → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: 标题上方的小字
	 * - **API ID Path**: hero.default.primary.eyebrow
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eyebrow: prismic.KeyTextField;
	
	/**
	 * 主标题 field in *Hero → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * 副文案 field in *Hero → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * 主按钮 field in *Hero → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.default.primary.primary_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	primary_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * 次按钮 field in *Hero → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.default.primary.secondary_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	secondary_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * 锚点 ID field in *Hero → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: 留空则不生成锚点
	 * - **API ID Path**: hero.default.primary.anchor_id
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	anchor_id: prismic.KeyTextField;
}

/**
 * Default variation for Hero Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HeroSliceDefault = prismic.SharedSliceVariation<"default", Simplify<HeroSliceDefaultPrimary>, never>;

/**
 * Primary content in *Hero → With Image → Primary*
 */
export interface HeroSliceWithImagePrimary {
	/**
	 * 眉标 field in *Hero → With Image → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.withImage.primary.eyebrow
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eyebrow: prismic.KeyTextField;
	
	/**
	 * 主标题 field in *Hero → With Image → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.withImage.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * 副文案 field in *Hero → With Image → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.withImage.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * 主按钮 field in *Hero → With Image → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.withImage.primary.primary_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	primary_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * 次按钮 field in *Hero → With Image → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.withImage.primary.secondary_link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	secondary_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * 配图 field in *Hero → With Image → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.withImage.primary.image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
	
	/**
	 * 锚点 ID field in *Hero → With Image → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: 留空则不生成锚点
	 * - **API ID Path**: hero.withImage.primary.anchor_id
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	anchor_id: prismic.KeyTextField;
}

/**
 * With Image variation for Hero Slice
 *
 * - **API ID**: `withImage`
 * - **Description**: With Image
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HeroSliceWithImage = prismic.SharedSliceVariation<"withImage", Simplify<HeroSliceWithImagePrimary>, never>;

/**
 * Slice variation for *Hero*
 */
type HeroSliceVariation = HeroSliceDefault | HeroSliceWithImage

/**
 * Hero Shared Slice
 *
 * - **API ID**: `hero`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HeroSlice = prismic.SharedSlice<"hero", HeroSliceVariation>;

/**
 * Primary content in *Image Text → Default → Primary*
 */
export interface ImageTextSliceDefaultPrimary {
	/**
	 * 标题 field in *Image Text → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: image_text.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * 正文 field in *Image Text → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: image_text.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * 配图 field in *Image Text → Default → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: image_text.default.primary.image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
	
	/**
	 * 链接 field in *Image Text → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: image_text.default.primary.link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Default variation for Image Text Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ImageTextSliceDefault = prismic.SharedSliceVariation<"default", Simplify<ImageTextSliceDefaultPrimary>, never>;

/**
 * Primary content in *Image Text → Image Left → Primary*
 */
export interface ImageTextSliceImageLeftPrimary {
	/**
	 * 标题 field in *Image Text → Image Left → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: image_text.imageLeft.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * 正文 field in *Image Text → Image Left → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: image_text.imageLeft.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * 配图 field in *Image Text → Image Left → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: image_text.imageLeft.primary.image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
	
	/**
	 * 链接 field in *Image Text → Image Left → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: image_text.imageLeft.primary.link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Image Left variation for Image Text Slice
 *
 * - **API ID**: `imageLeft`
 * - **Description**: Image Left
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ImageTextSliceImageLeft = prismic.SharedSliceVariation<"imageLeft", Simplify<ImageTextSliceImageLeftPrimary>, never>;

/**
 * Slice variation for *Image Text*
 */
type ImageTextSliceVariation = ImageTextSliceDefault | ImageTextSliceImageLeft

/**
 * Image Text Shared Slice
 *
 * - **API ID**: `image_text`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ImageTextSlice = prismic.SharedSlice<"image_text", ImageTextSliceVariation>;

/**
 * Item in *Logo Wall → Default → Primary → Logo*
 */
export interface LogoWallSliceDefaultPrimaryLogosItem {
	/**
	 * 图片 field in *Logo Wall → Default → Primary → Logo*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: logo_wall.default.primary.logos[].logo
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	logo: prismic.ImageField<never>;
	
	/**
	 * 名称（无障碍替代文本） field in *Logo Wall → Default → Primary → Logo*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: logo_wall.default.primary.logos[].name
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	name: prismic.KeyTextField;
	
	/**
	 * 链接 field in *Logo Wall → Default → Primary → Logo*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: logo_wall.default.primary.logos[].link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Primary content in *Logo Wall → Default → Primary*
 */
export interface LogoWallSliceDefaultPrimary {
	/**
	 * 标题 field in *Logo Wall → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: logo_wall.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	heading: prismic.KeyTextField;
	
	/**
	 * Logo field in *Logo Wall → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: logo_wall.default.primary.logos[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	logos: prismic.GroupField<Simplify<LogoWallSliceDefaultPrimaryLogosItem>>;
}

/**
 * Default variation for Logo Wall Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type LogoWallSliceDefault = prismic.SharedSliceVariation<"default", Simplify<LogoWallSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Logo Wall*
 */
type LogoWallSliceVariation = LogoWallSliceDefault

/**
 * Logo Wall Shared Slice
 *
 * - **API ID**: `logo_wall`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type LogoWallSlice = prismic.SharedSlice<"logo_wall", LogoWallSliceVariation>;

/**
 * Item in *MediaCards → Default → Primary → 条目*
 */
export interface MediaCardsSliceDefaultPrimaryItemsItem {
	/**
	 * 眉标 field in *MediaCards → Default → Primary → 条目*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: 如 照护者这边
	 * - **API ID Path**: media_cards.default.primary.items[].eyebrow
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eyebrow: prismic.KeyTextField;
	
	/**
	 * 标题 field in *MediaCards → Default → Primary → 条目*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: media_cards.default.primary.items[].title
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
	
	/**
	 * 说明 field in *MediaCards → Default → Primary → 条目*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: media_cards.default.primary.items[].body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * 配图 field in *MediaCards → Default → Primary → 条目*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: media_cards.default.primary.items[].image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
}

/**
 * Primary content in *MediaCards → Default → Primary*
 */
export interface MediaCardsSliceDefaultPrimary {
	/**
	 * 标题 field in *MediaCards → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: media_cards.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * 引言 field in *MediaCards → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: media_cards.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * 每行列数 field in *MediaCards → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: 3
	 * - **API ID Path**: media_cards.default.primary.columns
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	columns: prismic.SelectField<"2" | "3", "filled">;
	
	/**
	 * 图文顺序 field in *MediaCards → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: imageFirst
	 * - **API ID Path**: media_cards.default.primary.layout
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	layout: prismic.SelectField<"imageFirst" | "textFirst", "filled">;
	
	/**
	 * 锚点 ID field in *MediaCards → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: 如 today，留空则不生成锚点
	 * - **API ID Path**: media_cards.default.primary.anchor_id
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	anchor_id: prismic.KeyTextField;
	
	/**
	 * 条目 field in *MediaCards → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: media_cards.default.primary.items[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	items: prismic.GroupField<Simplify<MediaCardsSliceDefaultPrimaryItemsItem>>;
}

/**
 * Default variation for MediaCards Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type MediaCardsSliceDefault = prismic.SharedSliceVariation<"default", Simplify<MediaCardsSliceDefaultPrimary>, never>;

/**
 * Slice variation for *MediaCards*
 */
type MediaCardsSliceVariation = MediaCardsSliceDefault

/**
 * MediaCards Shared Slice
 *
 * - **API ID**: `media_cards`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type MediaCardsSlice = prismic.SharedSlice<"media_cards", MediaCardsSliceVariation>;

/**
 * Primary content in *Rich Text → Default → Primary*
 */
export interface RichTextSliceDefaultPrimary {
	/**
	 * 正文 field in *Rich Text → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: rich_text.default.primary.content
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	content: prismic.RichTextField;
}

/**
 * Default variation for Rich Text Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type RichTextSliceDefault = prismic.SharedSliceVariation<"default", Simplify<RichTextSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Rich Text*
 */
type RichTextSliceVariation = RichTextSliceDefault

/**
 * Rich Text Shared Slice
 *
 * - **API ID**: `rich_text`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type RichTextSlice = prismic.SharedSlice<"rich_text", RichTextSliceVariation>;

/**
 * Item in *Stats → Default → Primary → 指标*
 */
export interface StatsSliceDefaultPrimaryItemsItem {
	/**
	 * 数值 field in *Stats → Default → Primary → 指标*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: 如 200+ / 99.9%
	 * - **API ID Path**: stats.default.primary.items[].value
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	value: prismic.KeyTextField;
	
	/**
	 * 名称 field in *Stats → Default → Primary → 指标*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: stats.default.primary.items[].label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label: prismic.KeyTextField;
	
	/**
	 * 补充说明 field in *Stats → Default → Primary → 指标*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: stats.default.primary.items[].description
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	description: prismic.KeyTextField;
}

/**
 * Primary content in *Stats → Default → Primary*
 */
export interface StatsSliceDefaultPrimary {
	/**
	 * 标题 field in *Stats → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: stats.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * 指标 field in *Stats → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: stats.default.primary.items[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	items: prismic.GroupField<Simplify<StatsSliceDefaultPrimaryItemsItem>>;
}

/**
 * Default variation for Stats Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type StatsSliceDefault = prismic.SharedSliceVariation<"default", Simplify<StatsSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Stats*
 */
type StatsSliceVariation = StatsSliceDefault

/**
 * Stats Shared Slice
 *
 * - **API ID**: `stats`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type StatsSlice = prismic.SharedSlice<"stats", StatsSliceVariation>;

/**
 * Item in *Testimonial → Default → Primary → 证言*
 */
export interface TestimonialSliceDefaultPrimaryItemsItem {
	/**
	 * 引述 field in *Testimonial → Default → Primary → 证言*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: testimonial.default.primary.items[].quote
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	quote: prismic.RichTextField;
	
	/**
	 * 姓名 field in *Testimonial → Default → Primary → 证言*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: testimonial.default.primary.items[].author_name
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	author_name: prismic.KeyTextField;
	
	/**
	 * 职位 / 公司 field in *Testimonial → Default → Primary → 证言*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: testimonial.default.primary.items[].author_title
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	author_title: prismic.KeyTextField;
	
	/**
	 * 头像 field in *Testimonial → Default → Primary → 证言*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: testimonial.default.primary.items[].author_avatar
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	author_avatar: prismic.ImageField<never>;
}

/**
 * Primary content in *Testimonial → Default → Primary*
 */
export interface TestimonialSliceDefaultPrimary {
	/**
	 * 标题 field in *Testimonial → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: testimonial.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * 证言 field in *Testimonial → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: testimonial.default.primary.items[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	items: prismic.GroupField<Simplify<TestimonialSliceDefaultPrimaryItemsItem>>;
}

/**
 * Default variation for Testimonial Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type TestimonialSliceDefault = prismic.SharedSliceVariation<"default", Simplify<TestimonialSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Testimonial*
 */
type TestimonialSliceVariation = TestimonialSliceDefault

/**
 * Testimonial Shared Slice
 *
 * - **API ID**: `testimonial`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type TestimonialSlice = prismic.SharedSlice<"testimonial", TestimonialSliceVariation>;

declare module "@prismicio/client" {
	interface CreateClient {
		(repositoryNameOrEndpoint: string, options?: prismic.ClientConfig): prismic.Client<AllDocumentTypes>;
	}
	
	interface CreateWriteClient {
		(repositoryNameOrEndpoint: string, options: prismic.WriteClientConfig): prismic.WriteClient<AllDocumentTypes>;
	}
	
	interface CreateMigration {
		(): prismic.Migration<AllDocumentTypes>;
	}
	
	namespace Content {
		export type {
			HomepageDocument,
			HomepageDocumentData,
			HomepageDocumentDataSlicesSlice,
			NewsIndexDocument,
			NewsIndexDocumentData,
			NewsIndexDocumentDataSlicesSlice,
			NewsPostDocument,
			NewsPostDocumentData,
			NewsPostDocumentDataSlicesSlice,
			PageDocument,
			PageDocumentData,
			PageDocumentDataSlicesSlice,
			ReleaseIndexDocument,
			ReleaseIndexDocumentData,
			ReleaseIndexDocumentDataSlicesSlice,
			ReleaseNoteDocument,
			ReleaseNoteDocumentData,
			ReleaseNoteDocumentDataChangesItem,
			SettingsDocument,
			SettingsDocumentData,
			SettingsDocumentDataSocialLinksItem,
			AllDocumentTypes,
			CalloutSlice,
			CalloutSliceDefaultPrimary,
			CalloutSliceVariation,
			CalloutSliceDefault,
			CtaBannerSlice,
			CtaBannerSliceDefaultPrimary,
			CtaBannerSliceLightPrimary,
			CtaBannerSliceVariation,
			CtaBannerSliceDefault,
			CtaBannerSliceLight,
			FaqSlice,
			FaqSliceDefaultPrimaryItemsItem,
			FaqSliceDefaultPrimary,
			FaqSliceVariation,
			FaqSliceDefault,
			FeatureGridSlice,
			FeatureGridSliceDefaultPrimaryItemsItem,
			FeatureGridSliceDefaultPrimary,
			FeatureGridSliceCardPrimaryItemsItem,
			FeatureGridSliceCardPrimary,
			FeatureGridSliceQuotePrimaryItemsItem,
			FeatureGridSliceQuotePrimary,
			FeatureGridSliceVariation,
			FeatureGridSliceDefault,
			FeatureGridSliceCard,
			FeatureGridSliceQuote,
			HeroSlice,
			HeroSliceDefaultPrimary,
			HeroSliceWithImagePrimary,
			HeroSliceVariation,
			HeroSliceDefault,
			HeroSliceWithImage,
			ImageTextSlice,
			ImageTextSliceDefaultPrimary,
			ImageTextSliceImageLeftPrimary,
			ImageTextSliceVariation,
			ImageTextSliceDefault,
			ImageTextSliceImageLeft,
			LogoWallSlice,
			LogoWallSliceDefaultPrimaryLogosItem,
			LogoWallSliceDefaultPrimary,
			LogoWallSliceVariation,
			LogoWallSliceDefault,
			MediaCardsSlice,
			MediaCardsSliceDefaultPrimaryItemsItem,
			MediaCardsSliceDefaultPrimary,
			MediaCardsSliceVariation,
			MediaCardsSliceDefault,
			RichTextSlice,
			RichTextSliceDefaultPrimary,
			RichTextSliceVariation,
			RichTextSliceDefault,
			StatsSlice,
			StatsSliceDefaultPrimaryItemsItem,
			StatsSliceDefaultPrimary,
			StatsSliceVariation,
			StatsSliceDefault,
			TestimonialSlice,
			TestimonialSliceDefaultPrimaryItemsItem,
			TestimonialSliceDefaultPrimary,
			TestimonialSliceVariation,
			TestimonialSliceDefault
		}
	}
}