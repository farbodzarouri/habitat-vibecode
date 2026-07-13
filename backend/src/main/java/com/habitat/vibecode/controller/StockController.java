package com.habitat.vibecode.controller;

import com.habitat.vibecode.entity.Stock;
import com.habitat.vibecode.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
public class StockController {

    @Autowired
    private StockService stockService;

    @PostMapping("/add")
    public ResponseEntity<Stock> addStock(@RequestBody Stock stock) {
        Stock newStock = stockService.addStock(stock);
        return new ResponseEntity<>(newStock, HttpStatus.CREATED);
    }

    @GetMapping("/all/ids")
    public ResponseEntity<List<Long>> getStockIds() {
        List<Long> stockIds = stockService.getAllStockIds();
        return new ResponseEntity<>(stockIds, HttpStatus.OK);
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<Stock> getStock(@PathVariable Long id) {
        return stockService.getStockById(id)
                .map(stock -> new ResponseEntity<>(stock, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}