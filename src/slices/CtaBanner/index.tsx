import { isFilled, type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { PrismicImage } from "@/components/PrismicImage";
import { RichText } from "@/components/RichText";
import type { SliceContext } from "@/lib/slice-context";

export type CtaBannerProps = SliceComponentProps<
  Content.CtaBannerSlice,
  SliceContext
>;

/**
 * 两个变体：
 *   default —— 墨色深底，内页收尾用
 *   light   —— 宣纸浅底大圆角卡，可就地展示小程序二维码，落地页收尾用
 *
 * 二维码刻意**不做弹窗**：弹窗要一个 client component，而本项目维持
 * 「不新增 client 组件」。就地展示还省掉一次点击，移动端也本就该直接用
 * 主按钮唤起小程序而不是扫码。详见迁移方案 §0 决策 2 与 §4A。
 */
export default function CtaBanner({ slice, context }: CtaBannerProps) {
  const { heading, body, primary_link, secondary_link } = slice.primary;
  const isLight = slice.variation === "light";

  const actions = (isFilled.link(primary_link) ||
    isFilled.link(secondary_link)) && (
    <div className="mt-9 flex flex-wrap justify-center gap-3">
      {isFilled.link(primary_link) && (
        <Button
          field={primary_link}
          variant="primary"
          className={isLight ? "" : "bg-surface-container hover:bg-sand-wash"}
        />
      )}
      {isFilled.link(secondary_link) && (
        <Button
          field={secondary_link}
          variant="secondary"
          className={
            isLight
              ? ""
              : "border-content-secondary text-sand hover:border-sand hover:bg-content-body"
          }
        />
      )}
    </div>
  );

  return (
    <section
      id={isLight ? slice.primary.anchor_id || undefined : undefined}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="py-section"
    >
      <Container>
        <div
          className={
            isLight
              ? "rounded-xl border border-sand bg-surface-container px-6 py-16 text-center shadow-brand-sm md:px-12 lg:py-20"
              : "rounded-card bg-content-primary px-6 py-14 text-center md:px-12"
          }
        >
          {isFilled.richText(heading) && (
            <div className="mx-auto max-w-2xl">
              <RichText
                field={heading}
                components={{
                  heading2: ({ children }) => (
                    <h2
                      className={`text-title-1 font-semibold md:text-display ${
                        isLight ? "text-content-primary" : "text-content-inverse"
                      }`}
                    >
                      {children}
                    </h2>
                  ),
                }}
              />
            </div>
          )}

          {isFilled.richText(body) && (
            <div
              className={`mx-auto mt-5 max-w-xl ${
                isLight ? "[&_p]:text-body-lg" : "[&_p]:text-sand"
              }`}
            >
              <RichText field={body} />
            </div>
          )}

          {actions}

          {isLight && slice.primary.show_qrcode && context?.settings && (
            <QrBlock settings={context.settings} />
          )}
        </div>
      </Container>
    </section>
  );
}

/**
 * 二维码就地展示。内容全部取自 settings 单例 —— 它是站点级的东西，
 * 导航栏按钮与这里指向同一份，不该按 slice 各存一份。
 */
function QrBlock({ settings }: { settings: Content.SettingsDocument }) {
  const {
    miniprogram_qrcode,
    miniprogram_qr_title,
    miniprogram_qr_description,
    miniprogram_qr_note,
  } = settings.data;

  return (
    <div className="mx-auto mt-12 flex max-w-sm flex-col items-center rounded-xl border border-sand bg-sand-wash p-8">
      {miniprogram_qr_title && (
        <p className="text-title-3 font-semibold text-content-primary">
          {miniprogram_qr_title}
        </p>
      )}
      {miniprogram_qr_description && (
        <p className="mt-2 text-body-sm leading-relaxed text-content-secondary">
          {miniprogram_qr_description}
        </p>
      )}

      <div className="mt-6 w-44">
        {isFilled.image(miniprogram_qrcode) ? (
          <PrismicImage
            field={miniprogram_qrcode}
            sizes="176px"
            className="h-auto w-full rounded-lg border border-sand bg-surface-container p-2"
          />
        ) : (
          <ImagePlaceholder label="二维码" aspect="aspect-square" />
        )}
      </div>

      {miniprogram_qr_note && (
        <p className="mt-5 text-note text-content-muted">
          {miniprogram_qr_note}
        </p>
      )}
    </div>
  );
}
