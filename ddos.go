package main

import (
    "fmt"
    "net/http"
    "os"
    "strconv"
    "sync"
)

func main() {
    // URL เป้าหมายและจำนวนบรรทัดคำสั่ง
    targetUrl := os.Args[1]
    threads, err := strconv.Atoi(os.Args[2])
    if err != nil {
        fmt.Println(err)
        return
    }

    var wg sync.WaitGroup

           //  จำนวนที่ระบุเพื่อสร้างคำขอ HTTP GET
    for i := 0; i < threads; i++ {
        wg.Add(1)
        go func(i int) {
            fmt.Println("Starting Requests GET", i)

                                // ส่งคำขอ HTTP GET ไปยัง URL เป้าหมาย
            resp, err := http.Get(targetUrl)
            if err != nil {
                fmt.Println(err)
                wg.Done()
                return
            }
            defer resp.Body.Close()

            wg.Done()
        }(i)
    }
	
    wg.Wait()
}
