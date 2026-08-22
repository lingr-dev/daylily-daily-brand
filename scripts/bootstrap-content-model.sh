#!/usr/bin/env bash
#
# 一次性建模脚本 —— 记录本仓库内容模型是如何用 Prismic CLI 建出来的。
#
# 这是「历史记录 + 可复现手段」，不是日常工具：
# 模型的后续变更请直接用单条 CLI 命令（prismic field add / type edit / ...），
# 绝不手改 customtypes/ 与 src/slices/*/model.json —— 那是官方 skill 的硬约束。
#
# 全程离线，不需要登录。推送到 Prismic 才需要 `prismic login` + `prismic push`。
#
# 用法（仅在需要从零重建模型时）：
#   rm -rf customtypes src/slices && bash scripts/bootstrap-content-model.sh
set -euo pipefail
cd "$(dirname "$0")/.."

p() { npx prismic "$@"; }

echo "==> 1/4 页面类型"

# 首页：单例，路由 /
p type create "Homepage" --format page --single

# 通用页面：路由 /:uid —— 关于我们、解决方案、联系我们、隐私政策等都用它
p type create "Page" --format page

# 新闻列表：单例，路由在 prismic.config.json 里手工校准为 /news
p type create "News Index" --format page --single --id news_index

# 新闻详情：路由在 prismic.config.json 里手工校准为 /news/:uid
p type create "News Post" --format page --id news_post

p field add rich-text title --to-type news_post --label "标题" --allow heading1 --single
p field add text excerpt --to-type news_post --label "摘要" --placeholder "列表页与分享卡片上显示的一句话"
p field add image cover --to-type news_post --label "封面图"
p field add date published_at --to-type news_post --label "发布日期"
# 正文字段排到 slice zone 之前，编辑视图里顺序才自然
p field reorder title --from-type news_post --before slices
p field reorder excerpt --from-type news_post --after title
p field reorder cover --from-type news_post --after excerpt
p field reorder published_at --from-type news_post --after cover

echo "==> 2/4 站点设置（非页面类型，单例）"

p type create "Settings" --single
p field add text site_name --to-type settings --label "站点名称"
p field add text site_tagline --to-type settings --label "一句话定位"
p field add image logo --to-type settings --label "Logo"
# 可重复的 link + 自定义文本，是 Prismic 现在做导航的推荐方式（无需 group）
p field add link primary_nav --to-type settings --label "主导航" --repeatable --allow-text
p field add link footer_nav --to-type settings --label "页脚导航" --repeatable --allow-text
p field add rich-text footer_note --to-type settings --label "页脚说明" \
  --allow paragraph,strong,em,hyperlink
p field add text icp_license --to-type settings --label "ICP 备案号" \
  --placeholder "京ICP备00000000号-1"
p field add text contact_email --to-type settings --label "联系邮箱"
p field add text contact_phone --to-type settings --label "联系电话"
p field add text contact_address --to-type settings --label "办公地址"
p field add group social_links --to-type settings --label "社交账号"
p field add select social_links.platform --to-type settings --label "平台" \
  --option wechat --option weibo --option linkedin --option github --option youtube --option x
p field add link social_links.link --to-type settings --label "链接" --allow web

echo "==> 3/4 Slices"

# --- Hero ---------------------------------------------------------------
p slice create "Hero"
p field add text eyebrow --to-slice hero --label "眉标" --placeholder "标题上方的小字"
p field add rich-text heading --to-slice hero --label "主标题" --allow heading1 --single
p field add rich-text body --to-slice hero --label "副文案" \
  --allow paragraph,strong,em,hyperlink
p field add link primary_link --to-slice hero --label "主按钮" --allow-text
p field add link secondary_link --to-slice hero --label "次按钮" --allow-text
# 注意：Prismic 的 slice 变体之间「不继承」字段，每个变体都要独立声明一遍。
p slice add-variation "With Image" --to hero --id withImage
p field add text eyebrow --to-slice hero --variation withImage --label "眉标"
p field add rich-text heading --to-slice hero --variation withImage --label "主标题" \
  --allow heading1 --single
p field add rich-text body --to-slice hero --variation withImage --label "副文案" \
  --allow paragraph,strong,em,hyperlink
p field add link primary_link --to-slice hero --variation withImage --label "主按钮" --allow-text
p field add link secondary_link --to-slice hero --variation withImage --label "次按钮" --allow-text
p field add image image --to-slice hero --variation withImage --label "配图"

# --- Rich Text ----------------------------------------------------------
p slice create "Rich Text" --id rich_text
p field add rich-text content --to-slice rich_text --label "正文" \
  --allow heading2,heading3,heading4,paragraph,strong,em,hyperlink,list-item,o-list-item,image,embed,preformatted \
  --allow-target-blank

# --- Feature Grid -------------------------------------------------------
p slice create "Feature Grid" --id feature_grid
p field add rich-text heading --to-slice feature_grid --label "标题" --allow heading2 --single
p field add rich-text body --to-slice feature_grid --label "引言" --allow paragraph,strong,em
p field add select columns --to-slice feature_grid --label "每行列数" \
  --option 2 --option 3 --option 4 --default-value 3
p field add group items --to-slice feature_grid --label "条目"
p field add image items.icon --to-slice feature_grid --label "图标"
p field add text items.title --to-slice feature_grid --label "标题"
p field add rich-text items.description --to-slice feature_grid --label "描述" \
  --allow paragraph,strong,em,hyperlink

# --- Stats --------------------------------------------------------------
p slice create "Stats"
p field add rich-text heading --to-slice stats --label "标题" --allow heading2 --single
p field add group items --to-slice stats --label "指标"
p field add text items.value --to-slice stats --label "数值" --placeholder "如 200+ / 99.9%"
p field add text items.label --to-slice stats --label "名称"
p field add text items.description --to-slice stats --label "补充说明"

# --- Logo Wall ----------------------------------------------------------
p slice create "Logo Wall" --id logo_wall
p field add text heading --to-slice logo_wall --label "标题"
p field add group logos --to-slice logo_wall --label "Logo"
p field add image logos.logo --to-slice logo_wall --label "图片"
p field add text logos.name --to-slice logo_wall --label "名称（无障碍替代文本）"
p field add link logos.link --to-slice logo_wall --label "链接" --allow web --allow-target-blank

# --- Image Text ---------------------------------------------------------
p slice create "Image Text" --id image_text
p field add rich-text heading --to-slice image_text --label "标题" --allow heading2 --single
p field add rich-text body --to-slice image_text --label "正文" \
  --allow paragraph,strong,em,hyperlink,list-item
p field add image image --to-slice image_text --label "配图"
p field add link link --to-slice image_text --label "链接" --allow-text
p slice add-variation "Image Left" --to image_text --id imageLeft
p field add rich-text heading --to-slice image_text --variation imageLeft --label "标题" \
  --allow heading2 --single
p field add rich-text body --to-slice image_text --variation imageLeft --label "正文" \
  --allow paragraph,strong,em,hyperlink,list-item
p field add image image --to-slice image_text --variation imageLeft --label "配图"
p field add link link --to-slice image_text --variation imageLeft --label "链接" --allow-text

# --- Testimonial --------------------------------------------------------
p slice create "Testimonial"
p field add rich-text heading --to-slice testimonial --label "标题" --allow heading2 --single
p field add group items --to-slice testimonial --label "证言"
p field add rich-text items.quote --to-slice testimonial --label "引述" \
  --allow paragraph,strong,em
p field add text items.author_name --to-slice testimonial --label "姓名"
p field add text items.author_title --to-slice testimonial --label "职位 / 公司"
p field add image items.author_avatar --to-slice testimonial --label "头像"

# --- CTA Banner ---------------------------------------------------------
p slice create "Cta Banner" --id cta_banner
p field add rich-text heading --to-slice cta_banner --label "标题" --allow heading2 --single
p field add rich-text body --to-slice cta_banner --label "副文案" --allow paragraph,strong,em
p field add link primary_link --to-slice cta_banner --label "主按钮" --allow-text
p field add link secondary_link --to-slice cta_banner --label "次按钮" --allow-text

# --- FAQ ----------------------------------------------------------------
p slice create "Faq"
p field add rich-text heading --to-slice faq --label "标题" --allow heading2 --single
p field add group items --to-slice faq --label "问答"
p field add text items.question --to-slice faq --label "问题"
p field add rich-text items.answer --to-slice faq --label "回答" \
  --allow paragraph,strong,em,hyperlink,list-item,o-list-item

echo "==> 4/4 把 slice 挂到各页面类型的 slice zone"

ALL_SLICES="hero rich_text feature_grid stats logo_wall image_text testimonial cta_banner faq"

# 首页与通用页面：全部 slice 可用，营销同事自由拼装
for s in $ALL_SLICES; do
  p slice connect "$s" --to homepage
  p slice connect "$s" --to page
done

# 新闻列表页：只需要头部 + 说明 + 转化
for s in hero rich_text cta_banner; do
  p slice connect "$s" --to news_index
done

# 新闻详情页：正文向的 slice
for s in rich_text image_text cta_banner faq; do
  p slice connect "$s" --to news_post
done

echo "==> 生成 slice 索引与 TypeScript 类型"
p gen slice-index
p gen types

echo
echo "完成。下一步："
echo "  npx prismic status   # 看本地模型与远端的差异"
echo "  npx prismic push     # 推送到 Prismic（需先 login 并设好 repositoryName）"
