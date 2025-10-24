import { useWindowDimensions, Platform, I18nManager } from "react-native";
import React from "react";
import RenderHtml from "react-native-render-html";
import { useTranslation } from "react-i18next";

interface NativeWebViewProps {
  data: any;
}

const NativeWebView = ({ data }: NativeWebViewProps) => {
  const { width } = useWindowDimensions();
  const { i18n } = useTranslation();

  // Get current language
  const currentLanguage = i18n.language;
  const isRTL = I18nManager.isRTL;

  // Create HTML with proper RTL support
  const htmlContent = `
    <div style="
      direction: ${isRTL ? "rtl" : "ltr"};
      text-align: ${isRTL ? "right" : "left"};
      font-family: ${
        Platform.OS === "ios"
          ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          : "sans-serif"
      };
      line-height: 1.6;
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
      -webkit-hyphens: auto;
      -moz-hyphens: auto;
      -ms-hyphens: auto;
      padding: 10px;
      ${
        Platform.OS === "ios" && isRTL
          ? `
        writing-mode: horizontal-tb;
        unicode-bidi: bidi-override;
      `
          : ""
      }
    ">
      ${data}
    </div>
  `;

  const source = {
    html: htmlContent,
  };

  // RTL-specific render options
  const renderOptions = {
    contentWidth: width,
    source,
    // iOS RTL handling
    ...(Platform.OS === "ios" && isRTL
      ? {
          baseStyle: {
            direction: "rtl",
            textAlign: "right",
            writingDirection: "rtl",
          },
          tagsStyles: {
            p: {
              direction: "rtl",
              textAlign: "right",
              writingDirection: "rtl",
              marginBottom: 10,
            },
            div: {
              direction: "rtl",
              textAlign: "right",
              writingDirection: "rtl",
            },
          },
        }
      : {}),
  };

  return <RenderHtml {...renderOptions} />;
};

export default NativeWebView;
