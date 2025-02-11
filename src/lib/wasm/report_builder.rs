use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement};

#[wasm_bindgen]
pub struct ReportBuilder {
    context: CanvasRenderingContext2d,
}

#[wasm_bindgen]
impl ReportBuilder {
    #[wasm_bindgen(constructor)]
    pub fn new(canvas: HtmlCanvasElement) -> Result<ReportBuilder, JsValue> {
        let context = canvas
            .get_context("2d")?
            .unwrap()
            .dyn_into::<CanvasRenderingContext2d>()?;

        Ok(ReportBuilder { context })
    }

    pub fn draw_marker(&self, x: f64, y: f64, severity: &str) {
        let color = match severity {
            "high" => "#ff0000",
            "medium" => "#ffaa00",
            "low" => "#00ff00",
            _ => "#000000",
        };

        self.context.begin_path();
        self.context.set_fill_style(&JsValue::from_str(color));
        self.context.arc(x, y, 5.0, 0.0, 2.0 * std::f64::consts::PI).unwrap();
        self.context.fill();
    }
} 