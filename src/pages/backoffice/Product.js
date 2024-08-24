import { useEffect, useRef, useState } from "react";
import BackOffice from "../../components/BackOffice";
import Mydal from "../../components/MyModal";
import Swal from 'sweetalert2';
import axios from "axios";
import config from "../../config";
import MyModal from "../../components/MyModal";

function Product() {
    const [product, setProduct] = useState({});
    const [products, setProducts] = useState([]);
    const [img, setImg] = useState({});
    const [fileExcel, setFileExcel] = useState({});
    const refImg = useRef();
    const refExcel = useRef();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try{
            const res = await axios.get(config.apiPath + "/product/list", config.headers());
            
            if(res.data.results !== undefined){
                setProducts(res.data.results);
            }
        }catch(e){
            Swal.fire({
                title:'error',
                text: e.message,
                icon: 'error',
            });
        }
    }

    const handleSave = async () => {
        try{
            product.img = await handleUpload();
            product.price = parseInt(product.price);
            product.cost = parseInt(product.cost);

            let res;

            if (product.id === undefined){
                res = await axios.post(config.apiPath + "/product/create", product, config.headers());
            } else {
                res = await axios.put(config.apiPath + "/product/update", product, config.headers());
            }

            if(res.data.message === 'success'){
                Swal.fire({
                    title:'save',
                    text: 'success',
                    icon: 'success',
                    timer: 2000 //1000 = 1 วินาที
                })
                document.getElementById('modalProduct_btnClose').click();
                fetchData();

                setProduct({ ...product, id: undefined }); //clear id
            }
        }catch(e){
            Swal.fire({
                title:'error',
                text: e.message,
                icon: 'error',
            });
        }
    }

    const clearForm = () => {
        setProduct({
            name: '',
            price: '',
            cost: '',
        });
        setImg({});
        refImg.current.value = '';
    }

    const handleRemove = async (item) => {
        try{
            const button = await Swal.fire({
                text: 'remove item' ,
                title: 'remove' ,
                icon: 'question' ,
                showCancelButton: true,
                showConfirmButton: true
            })

            if(button.isConfirmed){
                const res = await axios.delete(config.apiPath + "/product/remove/" + item.id, config.headers());

                if(res.data.message === 'success'){
                    Swal.fire({
                        title: 'remove' ,
                        text: 'remove success' ,
                        icon: 'success' ,
                        timer: 1000
                    })

                    fetchData();
                }
            }

        }catch(e){
            Swal.fire({
                title:'error',
                text: e.message,
                icon: 'error',
            });
        }
    }    

    const selectedFile = (inputFile) => {
        if (inputFile !== undefined){
            if (inputFile.length > 0){
                setImg(inputFile[0]);
            }
        }
    }

    const handleUpload = async () => {
        try{
            const fromData = new FormData();
            fromData.append('img',img);

            const res = await axios.post(config.apiPath + '/product/upload', fromData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': localStorage.getItem('token')
                }
            })

            if (res.data.newName !== undefined){
                return res.data.newName;
            }
        }catch(e){
            Swal.fire({
                title:'error',
                text: e.message,
                icon: 'error',
            })

            return"";
        }
    }

    function showImage(item) {
        if (item.img !== ""){
            return <img alt='' className="img-fluid" src={config.apiPath + '/uploads/' + item.img}/>
        }

        return<></>
    }

    const selectedFileExcel = (fileInput) => {
        if (fileInput !== undefined){
            if (fileInput.length > 0){
                setFileExcel(fileInput[0]);
            }
        }
    }
    
    const handleUploadExcel = async () => {
        try {
            const fromData = new FormData();
            fromData.append('fileExcel',fileExcel);

            const res = await axios.post(config.apiPath + '/product/uploadFromExcel', fromData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': localStorage.getItem('token')
                }
            });

            if(res.data.message === 'success'){
                Swal.fire({
                    title: 'upload file',
                    text: 'upload success',
                    icon: 'success',
                    timer: 1000
                });

                fetchData();

                document.getElementById('modalExcel_btnClose').click();
            }
        }catch(e){
            Swal.fire({
                title:'error',
                text: e.message,
                icon: 'error',
            })
        }
    }
    
    const clearFormExcel = () => {
        refExcel.currentValue = '';
        setFileExcel(null);
    }

    return<BackOffice>
        <div className="h4">Product</div>
        <button onClick={clearForm} className="btn btn-primary mr-2" data-toggle="modal" data-target="#modalProduct">
            <i className="fa fa-plus mr-2"></i>เพิ่มรายการ
        </button>
        <button onClick={clearFormExcel} className="btn btn-success" data-toggle='modal' data-target='#modalExcel'>
            <i className="fa fa-arrow-down mr-2"></i>import from Excel
        </button>

        <table className="mt-3 table table-bordered table-striped">
            <thead>
                <tr>
                    <th width='150px'>ภาพสินค้า</th>
                    <th width='150px'>name</th>
                    <th width='150px' className="text-right">cost</th>
                    <th width='150px' className="text-right">price</th>
                    <th width='140px'></th>
                </tr>
            </thead>
            <tbody> 
                {products.length > 0 ? products.map(item =>
                    <tr key={item.id}>
                        <td>{showImage(item)}</td>
                        <td>{item.name}</td>
                        <td className="text-right">{item.cost}</td>
                        <td className="text-right">{item.price}</td>
                        <td className="text-center">
                            <button className="btn btn-primary mr-2"
                                data-toggle='modal'
                                data-target='#modalProduct'
                                onClick={e => setProduct(item)} >
                                <i className="fa fa-edit"></i>
                            </button>
                            <button className="btn btn-danger" onClick={e => handleRemove(item)}>
                                <i className="fa fa-times"></i>
                            </button>
                        </td>
                    </tr>
                ) : <></>}
            </tbody>
        </table>

        <Mydal id="modalProduct" title='สินค้า'>
            <div>
                <div>ชื่อสินค้า</div>
                <input value={product.name} className="form-control" onChange={e => setProduct({...product, name: e.target.value})}/>
            </div>
            <div className="mt-3">
                <div>ราคาทุน</div>
                <input value={product.cost} className="form-control" onChange={e => setProduct({...product, cost: e.target.value})}/>
            </div>
            <div className="mt-3">
                <div>ราคาขาย</div>
                <input value={product.price}className="form-control" onChange={e => setProduct({...product, price: e.target.value})}/>
            </div>
            <div className="mt-3">
                <div className="mb-3">{showImage(product)}</div>
                <div>ภาพสินค้า</div>
                <input className="form-control" type="file" ref={refImg} onChange={e => selectedFile(e.target.files)}/>
            </div>
            <div className="mt-3">
                <button className="btn btn-primary" onClick={handleSave}>
                    <i className="fa fa-save"></i>Save
                </button>
            </div>
        </Mydal>
        
        <MyModal id='modalExcel' title='เลือกไฟล์'>
            <div>เลือกไฟล์</div>
            <input className="form-control" type="file" ref={refExcel} onChange={e => selectedFileExcel(e.target.files)}/>

            <button className="from-control btn btn-primary" onClick={handleUploadExcel}>
                <i className="fa fa-check mr-2"></i>Save
            </button>
        </MyModal>
    </BackOffice>

    
}

export default Product;