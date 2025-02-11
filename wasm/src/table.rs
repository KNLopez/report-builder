use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize, Clone)]
pub struct Spot {
    pub id: String,
    pub name: String,
    pub status: String,
    pub metadata: Metadata,
    pub measurements: Measurements,
    pub images: Vec<Image>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Metadata {
    pub deviceId: String,
    pub installationDate: String,
    pub r#type: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Measurements {
    pub temperature: f64,
    pub humidity: f64,
    pub pressure: f64,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Image {
    pub id: String,
    pub url: String,
    pub caption: String,
    pub timestamp: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Column {
    pub key: String,
    pub label: String,
    pub visible: bool,
    pub width: f64,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ImageData {
    pub url: String,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TableCell {
    pub content: String,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub images: Option<Vec<ImageData>>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TablePage {
    pub cells: Vec<TableCell>,
    pub page_number: usize,
    pub y_offset: f64,
}

#[wasm_bindgen]
pub struct TableCalculator {
    page_height: f64,
    rows_per_page: usize,
    cell_height: f64,
    margin: f64,
}

#[wasm_bindgen]
impl TableCalculator {
    #[wasm_bindgen(constructor)]
    pub fn new(page_height: f64, rows_per_page: usize, cell_height: f64, margin: f64) -> Self {
        Self {
            page_height,
            rows_per_page,
            cell_height,
            margin,
        }
    }

    pub fn calculate_pages(&self, data: JsValue, columns: JsValue) -> Result<JsValue, JsValue> {
        let spots: Vec<Spot> = serde_wasm_bindgen::from_value(data)?;
        let columns: Vec<Column> = serde_wasm_bindgen::from_value(columns)?;
        
        let pages = self.paginate_data(&spots, &columns);
        Ok(serde_wasm_bindgen::to_value(&pages)?)
    }

    fn paginate_data(&self, spots: &[Spot], columns: &[Column]) -> Vec<TablePage> {
        let mut pages = Vec::new();
        let chunks = spots.chunks(self.rows_per_page);

        for (page_idx, chunk) in chunks.enumerate() {
            let y_offset = page_idx as f64 * (self.page_height + 20.0) + self.margin;
            let mut cells = Vec::new();

            for (row_idx, spot) in chunk.iter().enumerate() {
                for (col_idx, col) in columns.iter().enumerate() {
                    if !col.visible {
                        continue;
                    }

                    let x = self.calculate_x_position(col_idx, columns);
                    let y = y_offset + (row_idx as f64 + 1.0) * self.cell_height;

                    // Handle image column specially
                    if col.key == "images" && !spot.images.is_empty() {
                        let thumbnail_size = 60.0;
                        let images: Vec<ImageData> = spot.images
                            .iter()
                            .take(2)  // Only take first 2 images
                            .enumerate()
                            .map(|(img_idx, img)| ImageData {
                                url: img.url.clone(),
                                x: x + 8.0 + (img_idx as f64 * (thumbnail_size + 4.0)),
                                y: y + 10.0,
                                width: thumbnail_size,
                                height: thumbnail_size,
                            })
                            .collect();

                        cells.push(TableCell {
                            content: String::new(),
                            x,
                            y,
                            width: col.width,
                            height: self.cell_height,
                            images: Some(images),
                        });
                    } else {
                        cells.push(TableCell {
                            content: self.get_cell_content(spot, col),
                            x,
                            y,
                            width: col.width,
                            height: self.cell_height,
                            images: None,
                        });
                    }
                }
            }

            pages.push(TablePage {
                cells,
                page_number: page_idx + 1,
                y_offset,
            });
        }

        pages
    }

    fn calculate_x_position(&self, col_idx: usize, columns: &[Column]) -> f64 {
        columns[..col_idx]
            .iter()
            .filter(|c| c.visible)
            .map(|c| c.width)
            .sum::<f64>() + self.margin
    }

    fn get_cell_content(&self, spot: &Spot, col: &Column) -> String {
        match col.key.as_str() {
            "name" => spot.name.clone(),
            "status" => spot.status.clone(),
            "type" => spot.metadata.r#type.clone(),
            "deviceId" => spot.metadata.deviceId.clone(),
            "temperature" => format!("{}°C", spot.measurements.temperature),
            _ => String::new(),
        }
    }
} 