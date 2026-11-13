class sharedData{
    int item;
    boolean available=false;
    synchronized void produce(int data){
        try{
             while(available){
            wait();
        }
        item=data;
        available=true;
        System.out.println("Produced item"+ item);
        notify();

        }
        catch(InterupptedException e){
            System.out.println(e);
        }
       
    }
    synchronized void consume(){
        try{
             while(!available){
            wait();
        }
        available=false;
         System.out.println("cosnumed item"+ item);
         notify();
        }
        catch(InterupptedException e){
            System.out.println(e);
        }
    }


}
class Producer extends Thread{
    SharedData data;
    Producer(SharedData data){
        this.data=data;
    }
    for(int i=0;i<n;i++){

    }

}